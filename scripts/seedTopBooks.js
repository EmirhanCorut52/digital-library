const fs = require("fs");
const path = require("path");
const axios = require("axios");
const sequelize = require("../config/db");
const DEFAULT_COVER = "https://via.placeholder.com/300x450?text=No+Cover";
const User = require("../models/User");
const Book = require("../models/Book");
const Author = require("../models/Author");
const Post = require("../models/Post");
const PostLike = require("../models/PostLike");
const PostComment = require("../models/PostComment");
const Comment = require("../models/Comment");
const Follow = require("../models/Follow");

const models = {
  User,
  Book,
  Author,
  Post,
  PostLike,
  PostComment,
  Comment,
  Follow,
};
Object.keys(models).forEach((name) => {
  if (typeof models[name].associate === "function") {
    models[name].associate(models);
  }
});

async function ensureConnection() {
  await sequelize.authenticate();
}

async function findCoverFromOpenLibrary(entry) {
  const title = entry?.title || "";
  const author = Array.isArray(entry?.authors) ? entry.authors[0] || "" : "";
  if (!title) return null;

  try {
    const url = `https://openlibrary.org/search.json?title=${encodeURIComponent(
      title
    )}${author ? `&author=${encodeURIComponent(author)}` : ""}&limit=1`;
    const res = await axios.get(url, { timeout: 8000 });
    const doc = res.data?.docs?.[0];
    const coverId = doc?.cover_i;
    if (coverId) {
      return `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
    }
  } catch (err) {
    console.warn(`Cover fetch failed for ${title}:`, err?.message || err);
  }
  return null;
}

async function upsertBook(entry) {
  const defaults = {
    title: entry.title,
    category: entry.category || "General",
    publisher: entry.publisher || null,
    page_count: entry.page_count || null,
    description: entry.description || null,
    cover_image: entry.cover_image || null,
  };

  const [book, created] = await Book.findOrCreate({
    where: { title: entry.title },
    defaults,
  });

  if (!created) {
    await book.update(defaults);
  }

  if (Array.isArray(entry.authors) && entry.authors.length) {
    const authorRecords = await Promise.all(
      entry.authors.map((name) =>
        Author.findOrCreate({
          where: { full_name: name },
          defaults: { full_name: name },
        })
      )
    );
    await book.setAuthors(authorRecords.map(([a]) => a));
  }

  return created;
}

async function main() {
  await ensureConnection();

  const dataPath = path.join(__dirname, "topBooks.json");
  const payload = JSON.parse(fs.readFileSync(dataPath, "utf-8"));
  if (!Array.isArray(payload)) {
    throw new Error("topBooks.json must be an array");
  }

  let created = 0;
  let updated = 0;

  for (const entry of payload) {
    if (!entry?.title) continue;

    if (!entry.cover_image) {
      entry.cover_image = await findCoverFromOpenLibrary(entry);
    }

    if (!entry.cover_image) {
      entry.cover_image = DEFAULT_COVER;
    }

    const wasCreated = await upsertBook(entry);
    if (wasCreated) created += 1;
    else updated += 1;
  }

  console.log(`Done. Created: ${created}, Updated: ${updated}`);
  await sequelize.close();
}

main().catch((err) => {
  console.error("Seed error", err);
  sequelize.close();
  process.exit(1);
});
