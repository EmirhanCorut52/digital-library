const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");

router.post("/follow", authMiddleware, userController.follow);
router.post("/unfollow", authMiddleware, userController.unfollow);
router.get(
  "/follow-status/:id",
  authMiddleware,
  userController.getFollowStatus
);

router.get("/profile/:id", userController.getProfile);
router.get("/following/:id", userController.getFollowing);
router.get("/followers/:id", userController.getFollowers);
router.get("/search", userController.searchUsers);

module.exports = router;
