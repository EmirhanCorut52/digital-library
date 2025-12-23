const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Book = sequelize.define(
  "Book",
  {
    book_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    title: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    category: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    publisher: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    page_count: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    cover_image: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
  },
  {
    tableName: "Books",
    timestamps: false,
  }
);

Book.associate = (models) => {
  Book.belongsToMany(models.Author, {
    through: "BookAuthors",
    foreignKey: "book_id",
    otherKey: "author_id",
  });
  Book.hasMany(models.Post, { foreignKey: "tagged_book_id", onDelete: "SET NULL" });
  Book.hasMany(models.Comment, { foreignKey: "book_id", onDelete: "CASCADE" });
};

module.exports = Book;
