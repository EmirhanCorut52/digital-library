const express = require("express");
const cors = require("cors");
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
const PostLike = require("./models/PostLike");
const PostComment = require("./models/PostComment");
const Comment = require("./models/Comment");
const Follow = require("./models/Follow");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "0.0.0.0";

app.use(express.json());
app.use(cors());
app.use(express.static("public"));
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/users", userRoutes);
app.use("/api/search", SearchRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/authors", authorRoutes);

const models = {
  User,
  Book,
  Author,
  Post,
  PostLike,
  PostComment,
  Comment,
  Follow,
};

Object.keys(models).forEach((modelName) => {
  if (models[modelName].associate) {
    models[modelName].associate(models);
  }
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log("SUCCESS: Database connection established!");

    await sequelize.sync();
    console.log("SUCCESS: Models synchronized!");

    const server = app.listen(PORT, HOST);

    server.on("error", (error) => {
      console.error("SERVER ERROR:", error);
      process.exit(1);
    });
  } catch (error) {
    console.error("INITIALIZATION ERROR:", error);
    process.exit(1);
  }
})();
