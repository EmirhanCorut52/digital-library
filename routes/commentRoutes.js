const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post(
  "/books/:bookId/comment",
  authMiddleware,
  commentController.addComment
);

router.get("/book/:bookId", commentController.getBookComments);
router.get("/user/:userId", commentController.getUserComments);
router.delete("/:commentId", authMiddleware, commentController.deleteComment);

module.exports = router;
