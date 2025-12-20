const sequelize = require("./config/db");

async function dropTimestamps() {
  try {
    await sequelize.authenticate();

    const statements = [
      "ALTER TABLE BookAuthors DROP COLUMN createdAt",
      "ALTER TABLE BookAuthors DROP COLUMN updatedAt",
    ];

    for (const sql of statements) {
      try {
        await sequelize.query(sql);
      } catch (err) {
        // Ignore if column does not exist so the script is idempotent
        const msg = (err.message || "").toLowerCase();
        if (msg.includes("unknown column") || msg.includes("can't drop")) {
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

dropTimestamps();
