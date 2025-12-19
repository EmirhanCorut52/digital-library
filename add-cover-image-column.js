const sequelize = require("./config/db");

async function addCoverImageColumn() {
  try {
    await sequelize.authenticate();
    console.log("✅ Veritabanı bağlantısı başarılı.");

    // MySQL için kolon ekle
    await sequelize.query(
      `ALTER TABLE Books ADD COLUMN cover_image VARCHAR(500) NULL`
    );

    console.log("✅ cover_image kolonu Books tablosuna eklendi!");
    process.exit(0);
  } catch (error) {
    // Eğer kolon zaten varsa hatayı görmezden gel
    if (error.message.includes("Duplicate column")) {
      console.log("ℹ️  cover_image kolonu zaten mevcut.");
      process.exit(0);
    }
    console.error("❌ Hata:", error.message);
    process.exit(1);
  }
}

addCoverImageColumn();
