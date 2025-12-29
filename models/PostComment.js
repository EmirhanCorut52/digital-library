const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const PostComment = sequelize.define(
  "PostComment",
  {
    comment_id: {
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
    comment_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
  },
  {
    tableName: "PostComments",
    timestamps: true,
    underscored: true,
  }
);

PostComment.associate = (models) => {
  PostComment.belongsTo(models.Post, { foreignKey: "post_id" });
  PostComment.belongsTo(models.User, { foreignKey: "user_id" });
};

module.exports = PostComment;
