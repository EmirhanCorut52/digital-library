const Post = require("../models/Post");
const User = require("../models/User");
const Book = require("../models/Book");
const PostLike = require("../models/PostLike");
const PostComment = require("../models/PostComment");
const Follow = require("../models/Follow");

exports.createPost = async (req, res) => {
  try {
    const { text, tagged_book_id, tagged_user_id } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Gönderi metni boş olamaz." });
    }

    const payload = {
      post_text: text,
      user_id: req.userData.userId,
    };

    const parsedBookId = Number.isFinite(Number(tagged_book_id))
      ? Number(tagged_book_id)
      : null;
    const parsedTaggedUserId = Number.isFinite(Number(tagged_user_id))
      ? Number(tagged_user_id)
      : null;

    if (parsedBookId) {
      payload.tagged_book_id = parsedBookId;
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
    const currentUserId = req.userData?.userId;

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
        {
          model: PostLike,
          attributes: ["user_id"],
        },
        {
          model: PostComment,
          attributes: ["comment_id"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const shaped = posts.map((post) => {
      const json = post.toJSON();
      const likeCount = json.PostLikes ? json.PostLikes.length : 0;
      const commentCount = json.PostComments ? json.PostComments.length : 0;
      const isLiked = currentUserId
        ? json.PostLikes?.some((l) => l.user_id === currentUserId)
        : false;

      delete json.PostLikes;
      delete json.PostComments;

      return {
        ...json,
        likeCount,
        commentCount,
        isLiked,
      };
    });

    res.status(200).json(shaped);
  } catch (error) {
    res.status(500).json({ error: "Akış yüklenemedi." });
  }
};

exports.toggleLike = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userData?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Yetkisiz erişim!" });
    }

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: "Gönderi bulunamadı." });
    }

    const existing = await PostLike.findOne({
      where: { post_id: postId, user_id: userId },
    });

    if (existing) {
      await existing.destroy();
    } else {
      await PostLike.create({ post_id: postId, user_id: userId });
    }

    const likeCount = await PostLike.count({ where: { post_id: postId } });

    res.status(200).json({
      liked: !existing,
      likeCount,
    });
  } catch (error) {
    res.status(500).json({ error: "Beğeni işlemi başarısız oldu." });
  }
};

exports.addComment = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.userData.userId;
    const { comment_text } = req.body;

    if (!comment_text || !comment_text.trim()) {
      return res.status(400).json({ error: "Yorum metni boş olamaz." });
    }

    const post = await Post.findByPk(postId);
    if (!post) {
      return res.status(404).json({ error: "Gönderi bulunamadı." });
    }

    const newComment = await PostComment.create({
      post_id: postId,
      user_id: userId,
      comment_text: comment_text.trim(),
    });

    const commentCount = await PostComment.count({
      where: { post_id: postId },
    });

    res.status(201).json({
      message: "Yorum eklendi",
      comment: newComment,
      commentCount,
    });
  } catch (error) {
    res.status(500).json({ error: "Yorum eklenemedi." });
  }
};

exports.getComments = async (req, res) => {
  try {
    const postId = req.params.id;

    const comments = await PostComment.findAll({
      where: { post_id: postId },
      include: [
        {
          model: User,
          attributes: ["user_id", "username"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: "Yorumlar yüklenemedi." });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userData?.userId;
    const userRole = req.userData?.role;

    if (!userId) {
      return res.status(401).json({ error: "Yetkisiz erişim!" });
    }

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

exports.getFollowingFeed = async (req, res) => {
  try {
    const currentUserId = req.userData?.userId;

    if (!currentUserId) {
      return res.status(401).json({ error: "Kullanıcı kimliği bulunamadı." });
    }

    const followedUsers = await Follow.findAll({
      where: { follower_id: currentUserId },
      attributes: ["following_id"],
    });

    const followedIds = followedUsers.map((f) => f.following_id);

    if (followedIds.length === 0) {
      return res.status(200).json([]);
    }

    const posts = await Post.findAll({
      where: { user_id: followedIds },
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
        {
          model: PostLike,
          attributes: ["user_id"],
        },
        {
          model: PostComment,
          attributes: ["comment_id"],
        },
      ],
      order: [["created_at", "DESC"]],
    });

    const shaped = posts.map((post) => {
      const json = post.toJSON();
      const likeCount = json.PostLikes ? json.PostLikes.length : 0;
      const commentCount = json.PostComments ? json.PostComments.length : 0;
      const isLiked = currentUserId
        ? json.PostLikes?.some((l) => l.user_id === currentUserId)
        : false;

      delete json.PostLikes;
      delete json.PostComments;

      return {
        ...json,
        likeCount,
        commentCount,
        isLiked,
      };
    });

    res.status(200).json(shaped);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Takip edilen kullanıcıların gönderileri yüklenemedi." });
  }
};
