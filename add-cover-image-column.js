const sequelize = require("./config/db");

async function addCoverImageColumn() {
  try {
    await sequelize.authenticate();

    await sequelize.query(
      `ALTER TABLE Books ADD COLUMN cover_image VARCHAR(500) NULL`
    );

    process.exit(0);
  } catch (error) {
    if (error.message.includes("Duplicate column")) {
      process.exit(0);
    }
    process.exit(1);
  }
}

addCoverImageColumn();
