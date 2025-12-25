const Author = require("../models/Author");
const Book = require("../models/Book");

exports.getAuthorBooks = async (req, res) => {
  try {
    const { id } = req.params;

    const author = await Author.findByPk(id, {
      attributes: ["author_id", "full_name"],
      include: [
        {
          model: Book,
          attributes: [
            "book_id",
            "title",
            "category",
            "page_count",
            "cover_image",
          ],
          through: { attributes: [] },
        },
      ],
    });

    if (!author) {
      return res.status(404).json({ error: "Yazar bulunamadı." });
    }

    res.status(200).json(author);
  } catch (error) {
    res.status(500).json({ error: "Yazar bilgileri getirilemedi." });
  }
};

exports.getAllAuthors = async (req, res) => {
  try {
    const authors = await Author.findAll({
      attributes: ["author_id", "full_name"],
      include: [
        {
          model: Book,
          attributes: ["book_id"],
          through: { attributes: [] },
        },
      ],
    });

    res.status(200).json(authors);
  } catch (error) {
    res.status(500).json({ error: "Yazarlar getirilemedi." });
  }
};
