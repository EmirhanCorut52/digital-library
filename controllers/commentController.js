const Comment = require("../models/Comment");
const Book = require("../models/Book");
const User = require("../models/User");
const sequelize = require("../config/db");

exports.addComment = async (req, res) => {
  try {
    const { bookId } = req.params;
    const { comment_text, rating } = req.body;
    const user_id = req.userData?.userId;

    if (!user_id) {
      return res.status(401).json({ error: "Yetkisiz erişim!" });
    }

    if (rating < 1 || rating > 5) {
      return res
        .status(400)
        .json({ error: "Puan 1 ile 5 arasında olmalıdır." });
    }

    const book = await Book.findByPk(bookId);
    if (!book) {
      return res
        .status(404)
        .json({ error: "Yorum yapılacak kitap bulunamadı." });
    }

    const newComment = await Comment.create({
      book_id: bookId,
      user_id: user_id,
      comment_text: comment_text,
      rating: rating,
    });

    res.status(201).json({
      message: "Yorumunuz başarıyla eklendi!",
      comment: newComment,
    });
  } catch (error) {
    res.status(500).json({ error: "Yorum eklenirken hata oluştu." });
  }
};

exports.getBookComments = async (req, res) => {
  try {
    const { bookId } = req.params;

    const comments = await Comment.findAll({
      where: { book_id: bookId },
      include: [
        {
          model: User,
          attributes: ["username"],
        },
      ],
    });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: "Yorumlar yüklenemedi." });
  }
};

exports.getUserComments = async (req, res) => {
  try {
    const userId = req.params.userId;

    const rows = await Comment.findAll({
      where: { user_id: userId },
      attributes: ["comment_id", "comment_text", "rating", "createdAt"],
      include: [
        {
          model: Book,
          attributes: ["title", "book_id"],
          include: [
            {
              model: require("../models/Author"),
              attributes: ["full_name"],
              through: { attributes: [] },
            },
          ],
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    const comments = rows.map((c) => ({
      comment_id: c.comment_id,
      comment_text: c.comment_text,
      rating: c.rating,
      created_at: c.createdAt,
      book_title: c.Book ? c.Book.title : null,
      book_author:
        c.Book && c.Book.Authors && c.Book.Authors.length > 0
          ? c.Book.Authors.map((a) => a.full_name).join(", ")
          : null,
    }));

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: "Comments could not be loaded." });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const userId = req.userData?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Yetkisiz erişim!" });
    }

    const comment = await Comment.findByPk(commentId);
    if (!comment) {
      return res.status(404).json({ error: "Yorum bulunamadı." });
    }

    if (comment.user_id !== userId) {
      return res.status(403).json({ error: "Bu yorumu silme izniniz yok." });
    }

    await comment.destroy();
    res.status(200).json({ message: "Yorum başarıyla silindi." });
  } catch (error) {
    res.status(500).json({ error: "Yorum silinirken hata oluştu." });
  }
};
