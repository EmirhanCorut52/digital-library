const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/share", authMiddleware, postController.createPost);

router.get("/feed", authMiddleware, postController.getFeed);
router.get("/feed/following", authMiddleware, postController.getFollowingFeed);

router.delete("/:id", authMiddleware, postController.deletePost);

router.post("/:id/like", authMiddleware, postController.toggleLike);
router.post("/:id/comments", authMiddleware, postController.addComment);
router.get("/:id/comments", authMiddleware, postController.getComments);

module.exports = router;
