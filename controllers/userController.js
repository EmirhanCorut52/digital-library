const User = require("../models/User");
const Post = require("../models/Post");
const Follow = require("../models/Follow");
const Comment = require("../models/Comment");
const Sequelize = require("sequelize");
const Op = Sequelize.Op;

exports.follow = async (req, res) => {
  try {
    const followerId = req.userData.userId;
    const followingId = req.body.user_id;

    if (followerId == followingId) {
      return res.status(400).json({ error: "You cannot follow yourself." });
    }

    const existingFollow = await Follow.findOne({
      where: {
        follower_id: followerId,
        following_id: followingId,
      },
    });

    if (existingFollow) {
      return res
        .status(400)
        .json({ error: "Bu kullanıcıyı zaten takip ediyorsunuz." });
    }

    await Follow.create({
      follower_id: followerId,
      following_id: followingId,
    });

    res.status(200).json({ message: "User followed!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Takip işlemi başarısız oldu." });
  }
};

exports.unfollow = async (req, res) => {
  try {
    const followerId = req.userData.userId;
    const followingId = req.body.user_id;

    const deleted = await Follow.destroy({
      where: {
        follower_id: followerId,
        following_id: followingId,
      },
    });

    if (!deleted) {
      return res
        .status(400)
        .json({ error: "Bu kullanıcıyı takip etmiyorsunuz." });
    }

    res.status(200).json({ message: "Unfollowed." });
  } catch (error) {
    res.status(500).json({ error: "İşlem başarısız oldu." });
  }
};

exports.followStatus = async (req, res) => {
  try {
    const followerId = req.userData.userId;
    const followingId = req.params.id;

    const existingFollow = await Follow.findOne({
      where: {
        follower_id: followerId,
        following_id: followingId,
      },
    });

    res.status(200).json({ isFollowing: !!existingFollow });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Takip durumu kontrol edilemedi." });
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
    console.error(error);
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
    console.error(error);
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
    console.error(error);
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
    console.error(error);
    res.status(500).json({ error: "Kullanıcı arama hatası." });
  }
};
