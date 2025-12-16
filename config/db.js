const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: process.env.DB_DIALECT,
  }
);

(async () => {
  try {
    await sequelize.authenticate();
    console.log("Veritabanı bağlantısı başarılı.");
  } catch (error) {
    console.error("Veritabanı bağlantı hatası:", error);
  }
})();

module.exports = sequelize;
