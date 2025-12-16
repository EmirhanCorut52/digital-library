const Post = require("../models/Post");
const User = require("../models/User");

exports.createPost = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Post text cannot be empty." });
    }

    const newPost = await Post.create({
      post_text: text,
      user_id: req.userData.userId,
    });

    res.status(201).json({
      message: "Gönderi paylaşıldı!",
      post: newPost,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Gönderi oluşturulamadı." });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ["username"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Akış yüklenemedi." });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userData.userId;
    const userRole = req.userData.role;

    const post = await Post.findByPk(id);

    if (!post) {
      return res.status(404).json({ error: "Gönderi bulunamadı." });
    }

    if (post.user_id !== userId && userRole !== "admin") {
      return res
        .status(403)
        .json({ error: "Bu gönderiyi silme yetkiniz yok." });
    }

    await post.destroy();

    res.status(200).json({ message: "Gönderi başarıyla silindi." });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Silme işlemi başarısız oldu." });
  }
};
