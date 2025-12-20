require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DB_URL, {
  logging: false,
});

async function migrateAuthors() {
  try {
    await sequelize.authenticate();

    const [books] = await sequelize.query(`
      SELECT book_id, author FROM Books WHERE author IS NOT NULL AND author != ''
    `);

    for (const book of books) {
      const authorName = book.author.trim();

      const [existingAuthors] = await sequelize.query(
        `SELECT author_id FROM Authors WHERE full_name = ?`,
        { replacements: [authorName] }
      );

      let authorId;

      if (existingAuthors.length > 0) {
        authorId = existingAuthors[0].author_id;
      } else {
        const [result] = await sequelize.query(
          `INSERT INTO Authors (full_name) VALUES (?)`,
          { replacements: [authorName] }
        );
        authorId = result;
      }

      const [existingRelation] = await sequelize.query(
        `SELECT * FROM BookAuthors WHERE book_id = ? AND author_id = ?`,
        { replacements: [book.book_id, authorId] }
      );

      if (existingRelation.length === 0) {
        await sequelize.query(
          `INSERT INTO BookAuthors (book_id, author_id) VALUES (?, ?)`,
          { replacements: [book.book_id, authorId] }
        );
      }
    }

    process.exit(0);
  } catch (error) {
    process.exit(1);
  }
}

migrateAuthors();
