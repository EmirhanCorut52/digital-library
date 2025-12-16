const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/share", authMiddleware, postController.createPost);

router.get("/feed", postController.getFeed);

router.delete("/:id", authMiddleware, postController.deletePost);

module.exports = router;
