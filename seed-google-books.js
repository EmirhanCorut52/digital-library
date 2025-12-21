require("dotenv").config();
const { DataTypes } = require("sequelize");
const sequelize = require("./config/db");
const googleBooks = require("./services/googleBooks");
const Book = require("./models/Book");
const Author = require("./models/Author");
const Post = require("./models/Post");
const { Op } = require("sequelize");

const BookAuthor = sequelize.define(
  "BookAuthor",
  {
    book_id: { type: DataTypes.INTEGER, primaryKey: true },
    author_id: { type: DataTypes.INTEGER, primaryKey: true },
  },
  {
    tableName: "BookAuthors",
    timestamps: false,
  }
);

Book.belongsToMany(Author, {
  through: BookAuthor,
  foreignKey: "book_id",
  otherKey: "author_id",
});
Author.belongsToMany(Book, {
  through: BookAuthor,
  foreignKey: "author_id",
  otherKey: "book_id",
});

async function run() {
  const q = process.argv[2] || "subject:fiction";
  const maxResults = Number(process.argv[3] || 20);
  const apiKey = process.env.GOOGLE_BOOKS_API_KEY || undefined;

  console.log(
    `Importing from Google Books: q="${q}", maxResults=${maxResults}`
  );

  await sequelize.authenticate();
  await sequelize.sync();

  let created = 0;
  let skipped = 0;

  if (q === "purge" || q === "purge-tr-100") {
    const t = await sequelize.transaction();
    try {
      const qi = sequelize.getQueryInterface();
      await qi.bulkDelete("BookAuthors", {}, { transaction: t });
      await Post.update(
        { tagged_book_id: null },
        { where: { tagged_book_id: { [Op.ne]: null } }, transaction: t }
      );
      await Book.destroy({ where: {}, transaction: t });
      await t.commit();
      console.log("Purged all books successfully.");
    } catch (err) {
      await t.rollback();
      console.error("Purge failed:", err);
      process.exit(1);
    }
    if (q === "purge") {
      console.log("Done purge only.");
      process.exit(0);
    }
  }

  if (q === "random" || q === "purge-tr-100") {
    const pool = [
      "fiction",
      "history",
      "science",
      "technology",
      "novel",
      "biography",
      "philosophy",
      "poetry",
      "art",
      "education",
      "psychology",
      "adventure",
      "mystery",
      "romance",
      "thriller",
    ];
    const target =
      q === "purge-tr-100"
        ? 100
        : Number.isFinite(maxResults)
        ? maxResults
        : 100;
    const batchSize = Math.min(15, target);
    const lang = process.env.GOOGLE_BOOKS_LANG || "tr"; // Turkish language filter

    while (created < target) {
      const qPick = pool[Math.floor(Math.random() * pool.length)];
      const startIndex = Math.floor(Math.random() * 50); // Smaller range to avoid too many empty results
      let items = [];
      try {
        items = await googleBooks.searchVolumes({
          q: qPick,
          maxResults: batchSize,
          startIndex,
          apiKey,
          langRestrict: lang,
          hl: lang,
        });
      } catch (err) {
        console.warn(
          `Fetch failed (${qPick}, start=${startIndex}): ${err.message}`
        );
        skipped += 1;
        continue;
      }

      for (const item of items) {
        if (created >= target) break;
        const title = (item.title || "").trim();
        const vLang = String(
          item?._raw?.volumeInfo?.language || ""
        ).toLowerCase();
        if (lang && vLang && vLang !== lang) {
          skipped++;
          continue;
        }
        if (!title) continue;
        const existing = await Book.findOne({ where: { title } });
        if (existing) {
          skipped++;
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
        created++;
        console.log(`+ ${title}`);
      }
    }
  } else {
    const lang = (process.env.GOOGLE_BOOKS_LANG || "tr").toLowerCase();
    const items = await googleBooks.searchVolumes({
      q,
      maxResults,
      apiKey,
      langRestrict: lang,
      hl: lang,
    });
    for (const item of items) {
      const title = (item.title || "").trim();
      const vLang = String(
        item?._raw?.volumeInfo?.language || ""
      ).toLowerCase();
      if (lang && vLang && vLang !== lang) {
        skipped++;
        continue;
      }
      if (!title) continue;
      const existing = await Book.findOne({ where: { title } });
      if (existing) {
        skipped++;
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
      created++;
      console.log(`+ ${title}`);
    }
  }

  console.log(`Done. Created: ${created}, Skipped: ${skipped}`);
  process.exit(0);
}

run().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
