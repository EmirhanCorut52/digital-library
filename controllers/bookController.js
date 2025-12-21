const { Op, Sequelize } = require("sequelize");
const sequelize = require("../config/db");
const Book = require("../models/Book");
const Author = require("../models/Author");
const Comment = require("../models/Comment");
const User = require("../models/User");
const googleBooks = require("../services/googleBooks");
const fs = require("fs");
const path = require("path");
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

    const book = await Book.findByPk(id, {
      include: [{ model: Author }],
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

exports.importGoogleBooks = async (req, res) => {
  try {
    const { q, isbn, maxResults = 20, downloadImages = false } = req.body || {};
    const query = isbn ? `isbn:${String(isbn).trim()}` : String(q || "").trim();
    if (!query) {
      return res.status(400).json({ error: "Sorgu (q) veya ISBN gerekli." });
    }

    const apiKey = process.env.GOOGLE_BOOKS_API_KEY || undefined;
    const results = await googleBooks.searchVolumes({
      q: query,
      maxResults,
      apiKey,
    });

    const created = [];
    const skipped = [];

    for (const item of results) {
      const title = (item.title || "").trim();
      if (!title) continue;

      const existing = await Book.findOne({ where: { title } });
      if (existing) {
        skipped.push({ title, reason: "Mevcut" });
        continue;
      }

      const newBook = await Book.create({
        title,
        category: item.category || null,
        publisher: item.publisher || null,
        page_count: item.page_count || null,
        description: item.description || null,
        cover_image: item.cover_image || null,
      });

      if (downloadImages && item.cover_image) {
        try {
          const coversDir = path.join(process.cwd(), "public", "covers");
          fs.mkdirSync(coversDir, { recursive: true });
          const filename = `${newBook.book_id}.jpg`;
          const destPath = path.join(coversDir, filename);
          await new Promise((resolve, reject) => {
            const url = item.cover_image;
            const proto = url.startsWith("https://")
              ? require("https")
              : require("http");
            const file = fs.createWriteStream(destPath);
            const reqImg = proto.get(url, (response) => {
              if (response.statusCode !== 200) {
                file.close();
                fs.unlink(destPath, () => {});
                return reject(
                  new Error(
                    `Image download failed: HTTP ${response.statusCode}`
                  )
                );
              }
              response.pipe(file);
              file.on("finish", () => file.close(resolve));
            });
            reqImg.on("error", (err) => {
              file.close();
              fs.unlink(destPath, () => {});
              reject(err);
            });
          });
          const relative = `/covers/${filename}`;
          newBook.cover_image = relative;
          await newBook.save();
        } catch (e) {}
      }

      const authors = Array.isArray(item.authors) ? item.authors : [];
      for (const a of authors) {
        const name = String(a || "").trim();
        if (!name) continue;
        const [authorRecord] = await Author.findOrCreate({
          where: { full_name: name },
          defaults: { full_name: name },
        });
        await newBook.addAuthor(authorRecord);
      }

      created.push({ book_id: newBook.book_id, title });
    }

    return res.status(201).json({
      message: "Google Books'dan içe aktarma tamamlandı",
      imported_count: created.length,
      skipped_count: skipped.length,
      created,
      skipped,
    });
  } catch (error) {
    console.error("importGoogleBooks error", error);
    return res
      .status(500)
      .json({ error: "İçe aktarma başarısız", detail: error.message });
  }
};
