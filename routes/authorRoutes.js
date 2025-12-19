const express = require("express");
const router = express.Router();
const authorController = require("../controllers/authorController");
const verifyToken = require("../middlewares/authMiddleware");

router.get("/:id/books", verifyToken, authorController.getAuthorBooks);
router.get("/", verifyToken, authorController.getAllAuthors);

module.exports = router;
