const { Op, Sequelize } = require("sequelize");
const sequelize = require("../config/db");
const Book = require("../models/Book");
const Author = require("../models/Author");
const Comment = require("../models/Comment");
const User = require("../models/User");
exports.addBook = async (req, res) => {
  try {
    const { title, author, category, publisher, page_count, description } =
      req.body;

    if (!title) {
      return res.status(400).json({ error: "Kitap başlığı gereklidir." });
    }

    const newBook = await Book.create({
      title: title,
      author: author,
      category: category,
      publisher: publisher,
      page_count: page_count,
      description: description,
    });

    res.status(201).json({
      message: "Kitap başarıyla oluşturuldu!",
      book: newBook,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Kitap eklenirken hata oluştu." });
  }
};

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll();
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ error: "Kitaplar getirilemedi." });
  }
};

exports.getBookDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findByPk(id, {
      include: [
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: ["username"],
            },
          ],
        },
      ],
    });

    if (!book) {
      return res.status(404).json({ error: "Kitap bulunamadı." });
    }

    res.status(200).json(book);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Kitap detayları getirilemedi." });
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
    console.error(error);
    res.status(500).json({ error: "Kitap silinirken hata oluştu." });
  }
};

exports.searchBooks = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) return res.json([]);

    const books = await Book.findAll({
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${q}%` } },
          { author: { [Op.like]: `%${q}%` } },
          { category: { [Op.like]: `%${q}%` } },
        ],
      },
    });

    res.json(books);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Arama işlemi başarısız oldu" });
  }
};

exports.getPopularBooks = async (req, res) => {
  try {
    const [results] = await sequelize.query(`
      SELECT 
        b.book_id, 
        b.title, 
        b.author, 
        COUNT(c.comment_id) as comment_count
      FROM Books b
      LEFT JOIN Comments c ON b.book_id = c.book_id
      GROUP BY b.book_id, b.title, b.author
      ORDER BY comment_count DESC
      LIMIT 5
    `);

    res.status(200).json(results);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Popüler kitaplar yüklenemedi." });
  }
};
