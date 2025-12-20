const Post = require("../models/Post");
const User = require("../models/User");
const Book = require("../models/Book");

exports.createPost = async (req, res) => {
  try {
    const { text, book_id, tagged_user_id } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Post text cannot be empty." });
    }

    const payload = {
      post_text: text,
      user_id: req.userData.userId,
    };

    const parsedBookId = Number.isFinite(Number(book_id))
      ? Number(book_id)
      : null;
    const parsedTaggedUserId = Number.isFinite(Number(tagged_user_id))
      ? Number(tagged_user_id)
      : null;

    if (parsedBookId) {
      payload.book_id = parsedBookId;
    }
    if (parsedTaggedUserId) {
      payload.tagged_user_id = parsedTaggedUserId;
    }

    const newPost = await Post.create(payload);

    res.status(201).json({
      message: "Gönderi paylaşıldı!",
      post: newPost,
    });
  } catch (error) {
    res.status(500).json({ error: "Gönderi oluşturulamadı." });
  }
};

exports.getFeed = async (req, res) => {
  try {
    const posts = await Post.findAll({
      include: [
        {
          model: User,
          attributes: ["user_id", "username"],
        },
        {
          model: Book,
          attributes: ["book_id", "title", "cover_image"],
        },
        {
          model: User,
          as: "TaggedUser",
          attributes: ["user_id", "username"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(posts);
  } catch (error) {
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
    res.status(500).json({ error: "Silme işlemi başarısız oldu." });
  }
};
