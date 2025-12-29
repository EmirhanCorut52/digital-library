const express = require("express");
const router = express.Router();
const bookController = require("../controllers/bookController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

router.post("/add", authMiddleware, roleMiddleware, bookController.addBook);
router.post(
  "/import",
  authMiddleware,
  roleMiddleware,
  bookController.importFromGoogle
);

router.get("/", bookController.getAllBooks);
router.get("/search", bookController.searchBooks);
router.get("/:id", bookController.getBookDetails);

router.delete(
  "/:id",
  authMiddleware,
  roleMiddleware,
  bookController.deleteBook
);

module.exports = router;
