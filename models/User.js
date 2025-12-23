const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = sequelize.define(
  "User",
  {
    user_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM("user", "admin"),
      defaultValue: "user",
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Users",
    timestamps: false,
  }
);

User.associate = (models) => {
  User.hasMany(models.Post, { foreignKey: "user_id", onDelete: "CASCADE" });
  User.hasMany(models.Post, {
    foreignKey: "tagged_user_id",
    as: "TaggedPosts",
    onDelete: "SET NULL",
  });
  User.hasMany(models.PostLike, { foreignKey: "user_id", onDelete: "CASCADE" });
  User.hasMany(models.PostComment, { foreignKey: "user_id", onDelete: "CASCADE" });
  User.hasMany(models.Comment, { foreignKey: "user_id", onDelete: "CASCADE" });
  User.hasMany(models.Follow, { foreignKey: "follower_id", onDelete: "CASCADE" });
  User.hasMany(models.Follow, { foreignKey: "following_id", onDelete: "CASCADE" });
};

module.exports = User;
