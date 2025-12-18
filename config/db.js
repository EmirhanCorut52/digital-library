const { Sequelize } = require("sequelize");
require("dotenv").config();

const sequelize = new Sequelize(
  process.env.DB_URL,
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
