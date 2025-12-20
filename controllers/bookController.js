const { Op, Sequelize } = require("sequelize");
const sequelize = require("../config/db");
const Book = require("../models/Book");
const Author = require("../models/Author");
const Comment = require("../models/Comment");
const User = require("../models/User");
exports.addBook = async (req, res) => {
  try {
    const {
      title,
      author,
      category,
      publisher,
      page_count,
      description,
      cover_image,
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: "Kitap başlığı gereklidir." });
    }

    const newBook = await Book.create({
      title: title,
      category: category,
      publisher: publisher,
      page_count: page_count,
      description: description,
      cover_image: cover_image,
    });

    if (author) {
      const [authorRecord] = await Author.findOrCreate({
        where: { full_name: author.trim() },
        defaults: { full_name: author.trim() },
      });
      await newBook.addAuthor(authorRecord);
    }

    const bookWithAuthors = await Book.findByPk(newBook.book_id, {
      include: [{ model: Author }],
    });

    res.status(201).json({
      message: "Kitap başarıyla oluşturuldu!",
      book: bookWithAuthors,
    });
  } catch (error) {
    res.status(500).json({ error: "Kitap eklenirken hata oluştu." });
  }
};

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      include: [{ model: Author }],
    });
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: "Kitaplar getirilemedi." });
  }
};

exports.getBookDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Kitabı ve yazarlarını çekiyoruz
    const book = await Book.findByPk(id, {
      include: [{ model: Author }],
    });

    if (!book) {
      return res.status(404).json({ error: "Kitap bulunamadı." });
    }

    // Yorumları ayrı sorgu ile çekiyoruz; olası join/timestamp hatalarını izole etmek için
    const comments = await Comment.findAll({
      where: { book_id: id },
      include: [
        {
          model: User,
          attributes: ["username"],
        },
      ],
      order: [["comment_id", "DESC"]],
    });

    const payload = book.toJSON();
    payload.Comments = comments;

    res.status(200).json(payload);
  } catch (error) {
    console.error("getBookDetails error", error);
    res.status(500).json({
      error: "Kitap detayları getirilemedi.",
      detail: error.message,
      sql: error.original?.sqlMessage,
      stack: error.stack,
    });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findByPk(id);
    if (!book) {
      return res.status(404).json({ error: "Kitap bulunamadı." });
    }

    await book.destroy();

    res.status(200).json({
      message: "Kitap başarıyla silindi.",
    });
  } catch (error) {
    res.status(500).json({ error: "Kitap silinirken hata oluştu." });
  }
};

exports.searchBooks = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) return res.json([]);

    // Use a raw SQL query to safely match by title, category, or author name
    const [results] = await sequelize.query(
      `
      SELECT 
        b.book_id,
        b.title,
        b.cover_image,
        b.category,
        GROUP_CONCAT(a.full_name SEPARATOR ', ') as authors
      FROM Books b
      LEFT JOIN BookAuthors ba ON b.book_id = ba.book_id
      LEFT JOIN Authors a ON ba.author_id = a.author_id
      WHERE b.title LIKE :like OR b.category LIKE :like OR a.full_name LIKE :like
      GROUP BY b.book_id, b.title, b.cover_image, b.category
      ORDER BY b.title ASC
      LIMIT 25
      `,
      {
        replacements: { like: `%${q}%` },
      }
    );

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Arama işlemi başarısız oldu" });
  }
};

exports.getPopularBooks = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        b.book_id, 
        b.title, 
        b.cover_image,
        b.category,
        COUNT(c.comment_id) as comment_count,
        GROUP_CONCAT(a.full_name SEPARATOR ', ') as authors
      FROM Books b
      LEFT JOIN Comments c ON b.book_id = c.book_id
      LEFT JOIN BookAuthors ba ON b.book_id = ba.book_id
      LEFT JOIN Authors a ON ba.author_id = a.author_id
      GROUP BY b.book_id, b.title, b.cover_image, b.category
      ORDER BY comment_count DESC
      LIMIT 5
    `);

    res.json(results);
  } catch (error) {
    res.status(500).json({ error: "Popüler kitaplar yüklenemedi." });
  }
};
