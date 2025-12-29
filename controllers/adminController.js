const User = require("../models/User");
const Book = require("../models/Book");
const Post = require("../models/Post");
const Comment = require("../models/Comment");

const ALLOWED_ROLES = ["user", "admin"];

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalBooks = await Book.count();
    const totalPosts = await Post.count();
    const totalComments = await Comment.count();

    res.status(200).json({
      books: totalBooks,
      users: totalUsers,
      posts: totalPosts,
      comments: totalComments,
    });
  } catch (error) {
    console.error("Get dashboard stats error:", error);
    res.status(500).json({ error: "Raporlar oluşturulurken hata oluştu." });
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
    console.error("Get users list error:", error);
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

    res.status(200).json({
      message: "Rol güncellendi.",
      role: user.role,
    });
  } catch (error) {
    console.error("Update user role error:", error);
    res.status(500).json({ error: "Rol güncellenemedi." });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.userData && String(req.userData.userId) === String(id)) {
      return res.status(400).json({ error: "Kendinizi silemezsiniz." });
    }

    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    await user.destroy();
    res.status(200).json({ message: "Kullanıcı silindi." });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Kullanıcı silinemedi." });
  }
};
