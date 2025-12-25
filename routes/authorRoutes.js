const express = require("express");
const router = express.Router();
const authorController = require("../controllers/authorController");
const authMiddleware = require("../middlewares/authMiddleware");

router.get("/:id/books", authMiddleware, authorController.getAuthorBooks);
router.get("/", authMiddleware, authorController.getAllAuthors);

module.exports = router;
