const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const { DataTypes } = require("sequelize");
const sequelize = require("./config/db");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const userRoutes = require("./routes/userRoutes");
const SearchRoutes = require("./routes/searchRoutes");
const adminRoutes = require("./routes/adminRoutes");
const authorRoutes = require("./routes/authorRoutes");

const User = require("./models/User");
const Book = require("./models/Book");
const Author = require("./models/Author");
const Post = require("./models/Post");
const Comment = require("./models/Comment");
const Follow = require("./models/Follow");

// Explicit through model so we can disable timestamps safely
const BookAuthor = sequelize.define(
  "BookAuthor",
  {
    book_id: { type: DataTypes.INTEGER, primaryKey: true },
    author_id: { type: DataTypes.INTEGER, primaryKey: true },
  },
  {
    tableName: "BookAuthors",
    timestamps: false,
  }
);

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/search", SearchRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/authors", authorRoutes);

Book.belongsToMany(Author, {
  through: BookAuthor,
  foreignKey: "book_id",
  otherKey: "author_id",
});
Author.belongsToMany(Book, {
  through: BookAuthor,
  foreignKey: "author_id",
  otherKey: "book_id",
});

User.hasMany(Post, { foreignKey: "user_id", onDelete: "CASCADE" });
Post.belongsTo(User, { foreignKey: "user_id" });

Book.hasMany(Post, { foreignKey: "book_id", onDelete: "SET NULL" });
Post.belongsTo(Book, { foreignKey: "book_id" });

User.hasMany(Post, {
  foreignKey: "tagged_user_id",
  as: "TaggedPosts",
  onDelete: "SET NULL",
});
Post.belongsTo(User, { foreignKey: "tagged_user_id", as: "TaggedUser" });

User.hasMany(Comment, { foreignKey: "user_id", onDelete: "CASCADE" });
Comment.belongsTo(User, { foreignKey: "user_id" });

Book.hasMany(Comment, { foreignKey: "book_id", onDelete: "CASCADE" });
Comment.belongsTo(Book, { foreignKey: "book_id" });

Follow.belongsTo(User, {
  foreignKey: "follower_id",
  as: "Follower",
  onDelete: "CASCADE",
});
Follow.belongsTo(User, {
  foreignKey: "following_id",
  as: "Following",
  onDelete: "CASCADE",
});
User.hasMany(Follow, { foreignKey: "follower_id", onDelete: "CASCADE" });
User.hasMany(Follow, { foreignKey: "following_id", onDelete: "CASCADE" });

app.get("/", (req, res) => {
  res.send("Library System Server is Running!");
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log("SUCCESS: Database connection established!");

    await sequelize.sync();
    console.log("SUCCESS: Models synchronized!");

    const server = app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running at: http://localhost:${PORT}`);
    });

    server.on("error", (error) => {
      console.error("SERVER ERROR:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("INITIALIZATION ERROR:", error);
    process.exit(1);
  }
})();
