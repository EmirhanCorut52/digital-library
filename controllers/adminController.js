const User = require("../models/User");
const Book = require("../models/Book");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const sequelize = require("../config/db");

const ALLOWED_ROLES = ["user", "admin"];

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalBooks = await Book.count();
    const totalPosts = await Post.count();
    const totalComments = await Comment.count();

    let mostPopularBookTitle = "Henüz veri yok";
    let mostPopularBookCommentCount = 0;

    if (totalComments > 0) {
      const popularBook = await Comment.findOne({
        attributes: [
          "book_id",
          [
            sequelize.fn("COUNT", sequelize.col("Comment.book_id")),
            "comment_count",
          ],
        ],
        include: [
          {
            model: Book,
            attributes: ["title"],
          },
        ],
        group: ["Comment.book_id", "Book.book_id", "Book.title"],
        order: [[sequelize.literal("comment_count"), "DESC"]],
      });

      if (popularBook && popularBook.Book) {
        mostPopularBookTitle = popularBook.Book.title;
        mostPopularBookCommentCount = popularBook.dataValues.comment_count;
      }
    }

    res.status(200).json({
      books: totalBooks,
      users: totalUsers,
      posts: totalPosts,
      comments: totalComments,
      highlights: {
        most_discussed_book: mostPopularBookTitle,
        comment_count: mostPopularBookCommentCount,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "Raporlar oluşturulurken hata oluştu.",
      detail: error.message,
    });
  }
};

exports.getUsersList = async (req, res) => {
  try {
    const users = await User.findAll({
      attributes: [
        "user_id",
        "username",
        "name",
        "email",
        "role",
        "created_at",
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Kullanıcılar yüklenemedi." });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!ALLOWED_ROLES.includes(role)) {
      return res.status(400).json({ error: "Geçersiz rol." });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    user.role = role;
    await user.save();

    res.status(200).json({ message: "Rol güncellendi.", role: user.role });
  } catch (error) {
    res.status(500).json({ error: "Rol güncellenemedi." });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    await user.destroy();
    res.status(200).json({ message: "Kullanıcı silindi." });
  } catch (error) {
    res.status(500).json({ error: "Kullanıcı silinemedi." });
  }
};
