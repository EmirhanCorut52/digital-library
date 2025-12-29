const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Comment = sequelize.define(
  "Comment",
  {
    comment_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    comment_text: {
      type: DataTypes.TEXT,
    },
    rating: {
      type: DataTypes.INTEGER,
    },
    book_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
  },
  {
    tableName: "Comments",
    timestamps: true,
    underscored: true,
  }
);

Comment.associate = (models) => {
  Comment.belongsTo(models.User, { foreignKey: "user_id" });
  Comment.belongsTo(models.Book, { foreignKey: "book_id" });
};

module.exports = Comment;
