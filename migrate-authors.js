require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DB_URL, {
  logging: false,
});

async function migrateAuthors() {
  try {
    await sequelize.authenticate();
    console.log("✅ Veritabanı bağlantısı başarılı.");

    // Books tablosundan tüm kitapları al
    const [books] = await sequelize.query(`
      SELECT book_id, author FROM Books WHERE author IS NOT NULL AND author != ''
    `);

    console.log(`📚 ${books.length} kitap bulundu.`);

    for (const book of books) {
      const authorName = book.author.trim();

      // Yazar var mı kontrol et
      const [existingAuthors] = await sequelize.query(
        `SELECT author_id FROM Authors WHERE full_name = ?`,
        { replacements: [authorName] }
      );

      let authorId;

      if (existingAuthors.length > 0) {
        authorId = existingAuthors[0].author_id;
        console.log(
          `   ℹ️  Mevcut yazar kullanıldı: ${authorName} (ID: ${authorId})`
        );
      } else {
        // Yeni yazar ekle
        const [result] = await sequelize.query(
          `INSERT INTO Authors (full_name) VALUES (?)`,
          { replacements: [authorName] }
        );
        authorId = result;
        console.log(
          `   ✅ Yeni yazar eklendi: ${authorName} (ID: ${authorId})`
        );
      }

      // BookAuthors ilişkisi var mı kontrol et
      const [existingRelation] = await sequelize.query(
        `SELECT * FROM BookAuthors WHERE book_id = ? AND author_id = ?`,
        { replacements: [book.book_id, authorId] }
      );

      if (existingRelation.length === 0) {
        // İlişkiyi ekle
        await sequelize.query(
          `INSERT INTO BookAuthors (book_id, author_id, createdAt, updatedAt) VALUES (?, ?, NOW(), NOW())`,
          { replacements: [book.book_id, authorId] }
        );
        console.log(
          `   🔗 İlişki oluşturuldu: Kitap ${book.book_id} <-> Yazar ${authorId}`
        );
      }
    }

    console.log("\n✅ Migrasyon tamamlandı!");
    console.log(
      "ℹ️  Books tablosundaki 'author' kolonunu şimdi silebilirsiniz."
    );

    process.exit(0);
  } catch (error) {
    console.error("❌ Hata:", error);
    process.exit(1);
  }
}

migrateAuthors();
