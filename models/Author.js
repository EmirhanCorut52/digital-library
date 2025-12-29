const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Author = sequelize.define(
  "Author",
  {
    author_id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    full_name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
  },
  {
    tableName: "Authors",
    timestamps: true,
    underscored: true,
  }
);

Author.associate = (models) => {
  Author.belongsToMany(models.Book, {
    through: { model: "BookAuthor", timestamps: false },
    foreignKey: "author_id",
    otherKey: "book_id",
  });
};

module.exports = Author;
