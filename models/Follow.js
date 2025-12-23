const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const Follow = sequelize.define(
  "Follow",
  {
    follower_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "user_id",
      },
      onDelete: "CASCADE",
    },
    following_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Users",
        key: "user_id",
      },
      onDelete: "CASCADE",
    },
  },
  {
    tableName: "Follows",
    timestamps: false,
    indexes: [
      {
        unique: true,
        fields: ["follower_id", "following_id"],
      },
    ],
  }
);

Follow.associate = (models) => {
  Follow.belongsTo(models.User, {
    foreignKey: "follower_id",
    as: "Follower",
    onDelete: "CASCADE",
  });
  Follow.belongsTo(models.User, {
    foreignKey: "following_id",
    as: "Following",
    onDelete: "CASCADE",
  });
};

module.exports = Follow;
