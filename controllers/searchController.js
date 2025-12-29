const { Op } = require("sequelize");
const sequelize = require("../config/db");
const Book = require("../models/Book");
const Author = require("../models/Author");
const User = require("../models/User");

exports.generalSearch = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) {
      return res.status(400).json({ error: "Arama terimini girin." });
    }

    const safeFind = async (fn) => {
      try {
        return await fn();
      } catch (err) {
        console.error("Search subquery failed:", err.message || err);
        return [];
      }
    };

    const [bookResults, authorResults, userResults] = await Promise.all([
      safeFind(() =>
        Book.findAll({
          where: { title: { [Op.like]: `%${q}%` } },
          limit: 10,
        })
      ),
      safeFind(() =>
        Author.findAll({
          where: { full_name: { [Op.like]: `%${q}%` } },
          limit: 10,
        })
      ),
      safeFind(() =>
        User.findAll({
          where: { username: { [Op.like]: `%${q}%` } },
          attributes: ["user_id", "username", "role"],
          limit: 10,
        })
      ),
    ]);

    res.status(200).json({
      result_message: `"${q}" için arama sonuçları:`,
      books: bookResults,
      authors: authorResults,
      users: userResults,
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({
      error: "Arama işlemi başarısız oldu.",
    });
  }
};
