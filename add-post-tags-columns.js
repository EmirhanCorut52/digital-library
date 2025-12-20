const sequelize = require("./config/db");

async function addPostTagColumns() {
  try {
    await sequelize.authenticate();

    const statements = [
      "ALTER TABLE Posts ADD COLUMN user_id INT NULL",
      "ALTER TABLE Posts ADD COLUMN book_id INT NULL",
      "ALTER TABLE Posts ADD COLUMN tagged_user_id INT NULL",
    ];

    for (const sql of statements) {
      try {
        await sequelize.query(sql);
      } catch (err) {
        // Ignore duplicate column errors so the script is idempotent
        if (
          err.message &&
          err.message.toLowerCase().includes("duplicate column")
        ) {
          continue;
        }
        throw err;
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("Migration failed:", error.message || error);
    process.exit(1);
  }
}

addPostTagColumns();
