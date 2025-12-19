require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DB_URL, {
  logging: false,
});

async function dropAuthorColumn() {
  try {
    await sequelize.authenticate();
    console.log("✅ Veritabanı bağlantısı başarılı.");

    await sequelize.query(`ALTER TABLE Books DROP COLUMN author`);

    console.log("✅ Books tablosundan 'author' kolonu silindi!");
    console.log("ℹ️  Artık tamamen ilişkisel yazar sistemi kullanılıyor.");

    process.exit(0);
  } catch (error) {
    if (error.message.includes("check that column/key exists")) {
      console.log("ℹ️  'author' kolonu zaten silinmiş.");
      process.exit(0);
    }
    console.error("❌ Hata:", error);
    process.exit(1);
  }
}

dropAuthorColumn();
