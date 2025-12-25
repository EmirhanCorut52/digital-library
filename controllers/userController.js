const User = require("../models/User");
const Post = require("../models/Post");
const Follow = require("../models/Follow");
const Comment = require("../models/Comment");
const { Op } = require("sequelize");

exports.toggleFollow = async (req, res) => {
  const followerId = req.userData?.userId;
  const followingId = req.body.user_id;

  if (!followerId) {
    return res.status(401).json({ error: "Yetkisiz erişim!" });
  }
  if (!followingId) {
    return res.status(400).json({ error: "Geçersiz kullanıcı." });
  }
  if (String(followerId) === String(followingId)) {
    return res.status(400).json({ error: "Kendinizi takip edemezsiniz." });
  }

  try {
    const existing = await Follow.findOne({
      where: { follower_id: followerId, following_id: followingId },
    });

    if (existing) {
      await existing.destroy();
      return res
        .status(200)
        .json({ message: "Kullanıcı takipten çıkarıldı.", isFollowing: false });
    }

    await Follow.create({
      follower_id: followerId,
      following_id: followingId,
    });
    return res
      .status(200)
      .json({ message: "Kullanıcı takip edildi.", isFollowing: true });
  } catch (error) {
    return res.status(500).json({ error: "İşlem başarısız oldu." });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findByPk(userId, {
      attributes: [
        "user_id",
        "username",
        "name",
        "email",
        "role",
        "created_at",
        "bio",
      ],
      include: [
        {
          model: Post,
          attributes: ["post_text", "created_at"],
        },
      ],
    });

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    const followerCount = await Follow.count({
      where: { following_id: userId },
    });
    const followingCount = await Follow.count({
      where: { follower_id: userId },
    });
    const commentCount = await Comment.count({
      where: { user_id: userId },
    });
    const postCount = await Post.count({
      where: { user_id: userId },
    });

    res.status(200).json({
      profile: user,
      stats: {
        followers: followerCount,
        following: followingCount,
        comments: commentCount,
        posts: postCount,
        books: 0,
      },
    });
  } catch (error) {
    res.status(500).json({ error: "Profil yüklenemedi." });
  }
};

exports.getFollowing = async (req, res) => {
  try {
    const userId = req.params.id;

    const following = await Follow.findAll({
      where: { follower_id: userId },
      include: [
        {
          model: User,
          as: "Following",
          attributes: ["user_id", "username", "name"],
        },
      ],
    });

    res.status(200).json(following.map((f) => f.Following));
  } catch (error) {
    res.status(500).json({ error: "Takip listesi yüklenemedi." });
  }
};

exports.getFollowers = async (req, res) => {
  try {
    const userId = req.params.id;

    const followers = await Follow.findAll({
      where: { following_id: userId },
      include: [
        {
          model: User,
          as: "Follower",
          attributes: ["user_id", "username", "name"],
        },
      ],
    });

    res.status(200).json(followers.map((f) => f.Follower));
  } catch (error) {
    res.status(500).json({ error: "Takipçi listesi yüklenemedi." });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) return res.json([]);

    const users = await User.findAll({
      where: {
        [Op.or]: [
          { username: { [Op.like]: `%${q}%` } },
          { name: { [Op.like]: `%${q}%` } },
        ],
      },
      attributes: ["user_id", "username", "name", "role"],
      limit: 10,
    });

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: "Kullanıcı arama hatası." });
  }
};

exports.getFollowStatus = async (req, res) => {
  try {
    const followerId = req.userData?.userId;
    const followingId = req.params.id;

    if (!followerId) {
      return res.status(401).json({ error: "Yetkisiz erişim!" });
    }

    const follow = await Follow.findOne({
      where: {
        follower_id: followerId,
        following_id: followingId,
      },
    });

    res.status(200).json({ isFollowing: !!follow });
  } catch (error) {
    res.status(500).json({ error: "Takip durumu kontrol hatası." });
  }
};
