require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DB_URL, {
  logging: false,
});

async function dropAuthorColumn() {
  try {
    await sequelize.authenticate();

    await sequelize.query(`ALTER TABLE Books DROP COLUMN author`);

    process.exit(0);
  } catch (error) {
    if (error.message.includes("check that column/key exists")) {
      process.exit(0);
    }
    process.exit(1);
  }
}

dropAuthorColumn();
