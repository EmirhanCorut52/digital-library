const sequelize = require("../config/db");
const { Op, QueryTypes } = require("sequelize");
const googleBooksService = require("../services/googleBooks");
const Book = require("../models/Book");
const Author = require("../models/Author");
const Comment = require("../models/Comment");
const User = require("../models/User");

exports.addBook = async (req, res) => {
  try {
    const {
      title,
      author,
      authors,
      category,
      publisher,
      page_count,
      description,
      cover_image,
    } = req.body;

    const newBook = await Book.create({
      title: title,
      category: category,
      publisher: publisher,
      page_count: page_count,
      description: description,
      cover_image: cover_image,
    });

    const authorList = Array.isArray(authors)
      ? authors.map((a) => String(a || "").trim()).filter((a) => a.length > 0)
      : [];

    if (authorList.length > 0) {
      for (const name of authorList) {
        const [authorRecord] = await Author.findOrCreate({
          where: { full_name: name },
          defaults: { full_name: name },
        });
        await newBook.addAuthor(authorRecord);
      }
    } else if (author) {
      const name = String(author).trim();
      if (name) {
        const [authorRecord] = await Author.findOrCreate({
          where: { full_name: name },
          defaults: { full_name: name },
        });
        await newBook.addAuthor(authorRecord);
      }
    }

    const bookWithAuthors = await Book.findByPk(newBook.book_id, {
      include: [
        {
          model: Author,
          attributes: ["author_id", "full_name"],
          through: { attributes: [] },
        },
      ],
    });

    res.status(201).json({
      message: "Kitap başarıyla oluşturuldu!",
      book: bookWithAuthors,
    });
  } catch (error) {
    console.error("Add book error:", error);
    res.status(500).json({ error: "Kitap eklenirken hata oluştu." });
  }
};

exports.getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll({
      include: [
        {
          model: Author,
          attributes: ["author_id", "full_name"],
          through: { attributes: [] },
        },
      ],
    });
    res.status(200).json(books);
  } catch (error) {
    console.error("Get all books error:", error);
    res.status(500).json({ error: "Kitaplar getirilemedi." });
  }
};

exports.getBookDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const book = await Book.findByPk(id, {
      include: [
        {
          model: Author,
          attributes: ["author_id", "full_name"],
          through: { attributes: [] },
        },
      ],
    });

    if (!book) {
      return res.status(404).json({ error: "Kitap bulunamadı." });
    }

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
    console.error("Get book details error:", error);
    res.status(500).json({
      error: "Kitap detayları getirilemedi.",
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
    console.error("Delete book error:", error);
    res.status(500).json({ error: "Kitap silinirken hata oluştu." });
  }
};

exports.searchBooks = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);

    const books = await Book.findAll({
      attributes: ["book_id", "title", "cover_image", "category"],
      include: [
        {
          model: Author,
          attributes: ["full_name"],
          through: { attributes: [] },
          required: false,
        },
      ],
      where: {
        [Op.or]: [
          { title: { [Op.like]: `%${q}%` } },
          { category: { [Op.like]: `%${q}%` } },
        ],
      },
      order: [["title", "ASC"]],
      limit: 25,
      subQuery: false,
    });

    if (books.length < 25) {
      const authorBooks = await sequelize.query(
        `SELECT DISTINCT b.book_id, b.title, b.cover_image, b.category
         FROM Books b
         JOIN BookAuthor ba ON b.book_id = ba.book_id
         JOIN Authors a ON ba.author_id = a.author_id
         WHERE a.full_name LIKE :searchTerm
         LIMIT :limit`,
        {
          replacements: { searchTerm: `%${q}%`, limit: 25 - books.length },
          type: QueryTypes.SELECT,
        }
      );

      const bookIds = books.map((b) => b.book_id);
      const filteredAuthorBooks = authorBooks.filter(
        (ab) => !bookIds.includes(ab.book_id)
      );
      books.push(...filteredAuthorBooks);
    }

    const results = books.map((book) => {
      const bookData = typeof book.toJSON === "function" ? book.toJSON() : book;
      const authors =
        bookData.Authors && bookData.Authors.length > 0
          ? bookData.Authors.map((a) => a.full_name).join(", ")
          : null;

      return {
        book_id: bookData.book_id,
        title: bookData.title,
        cover_image: bookData.cover_image,
        category: bookData.category,
        authors: authors,
      };
    });

    res.json(results);
  } catch (error) {
    console.error("Search books error:", error);
    res.status(500).json({ error: "Arama işlemi başarısız oldu" });
  }
};

exports.importFromGoogle = async (req, res) => {
  try {
    const { query } = req.body;

    if (!query) {
      return res.status(400).json({ error: "Lütfen bir arama terimi girin." });
    }

    const booksFromGoogle = await googleBooksService.searchBooks(query);

    if (booksFromGoogle.length === 0) {
      return res.status(404).json({ error: "Google'da kitap bulunamadı." });
    }

    let addedCount = 0;

    for (const item of booksFromGoogle) {
      const existingBook = await Book.findOne({
        where: { title: item.title },
      });

      if (!existingBook) {
        const newBook = await Book.create({
          title: item.title,
          description: item.description,
          page_count: item.page_count,
          publisher: item.publisher,
          cover_image: item.cover_image,
          category: item.category,
        });

        if (item.authors && item.authors.length > 0) {
          for (const authorName of item.authors) {
            const [author] = await Author.findOrCreate({
              where: { full_name: authorName },
              defaults: { full_name: authorName },
            });
            await newBook.addAuthor(author);
          }
        }
        addedCount++;
      }
    }

    res.status(200).json({
      message: "İçe aktarma tamamlandı.",
      found: booksFromGoogle.length,
      saved: addedCount,
    });
  } catch (error) {
    console.error("Google Import Hatası:", error);
    res.status(500).json({ error: "Kitaplar içe aktarılırken hata oluştu." });
  }
};
