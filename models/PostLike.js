const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PostLike = sequelize.define(
  "PostLike",
  {
    like_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    post_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "PostLikes",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["post_id", "user_id"],
      },
    ],
  }
);

module.exports = PostLike;
