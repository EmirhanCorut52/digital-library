const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Post = sequelize.define(
  "Post",
  {
    post_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    post_text: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    tagged_book_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    tagged_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: "Posts",
    timestamps: false,
  }
);

Post.associate = (models) => {
  Post.belongsTo(models.User, { foreignKey: "user_id" });
  Post.belongsTo(models.Book, { foreignKey: "tagged_book_id" });
  Post.belongsTo(models.User, { foreignKey: "tagged_user_id", as: "TaggedUser" });
  Post.hasMany(models.PostLike, { foreignKey: "post_id", onDelete: "CASCADE" });
  Post.hasMany(models.PostComment, { foreignKey: "post_id", onDelete: "CASCADE" });
};

module.exports = Post;
