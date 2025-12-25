const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.post("/add", authMiddleware, roleMiddleware, bookController.addBook);

router.get("/", bookController.getAllBooks);
router.get("/search", bookController.searchBooks);
router.get("/popular", bookController.getPopularBooks);
router.get("/:id", bookController.getBookDetails);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware,
  bookController.deleteBook
);

module.exports = router;
