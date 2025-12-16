const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const sequelize = require("./config/db");
const dotenv = require("dotenv");
const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const userRoutes = require("./routes/userRoutes");
const SearchRoutes = require("./routes/searchRoutes");
const adminRoutes = require("./routes/adminRoutes");

const User = require("./models/User");
const Book = require("./models/Book");
const Author = require("./models/Author");
const Post = require("./models/Post");
const Comment = require("./models/Comment");
const Follow = require("./models/Follow");

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

Book.belongsToMany(Author, { through: "BookAuthors", foreignKey: "book_id" });
Author.belongsToMany(Book, { through: "BookAuthors", foreignKey: "author_id" });

User.hasMany(Post, { foreignKey: "user_id", onDelete: "CASCADE" });
Post.belongsTo(User, { foreignKey: "user_id" });

User.hasMany(Comment, { foreignKey: "user_id", onDelete: "CASCADE" });
Comment.belongsTo(User, { foreignKey: "user_id" });

Book.hasMany(Comment, { foreignKey: "book_id", onDelete: "CASCADE" });
Comment.belongsTo(Book, { foreignKey: "book_id" });

Follow.belongsTo(User, { foreignKey: "follower_id", as: "Follower" });
Follow.belongsTo(User, { foreignKey: "following_id", as: "Following" });
User.hasMany(Follow, { foreignKey: "follower_id" });
User.hasMany(Follow, { foreignKey: "following_id" });

app.get("/", (req, res) => {
  res.send("Library System Server is Running!");
});

sequelize
  .authenticate()
  .then(() => {
    console.log("SUCCESS: Database connection established!");
    return sequelize.sync();
  })
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at: http://localhost:${PORT}`);
    });
  });
