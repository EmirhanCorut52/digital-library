const sequelize = require("./config/db");
const Book = require("./models/Book");

const sampleBooks = [
  {
    title: "1984",
    author: "George Orwell",
    category: "Distopya",
    publisher: "İletişim Yayınları",
    page_count: 352,
    description:
      "Totaliter bir rejimin korkunç geleceğini anlatan klasik distopya romanı.",
    cover_image: "https://images.isbndb.com/covers/28/68/9780547249643.jpg",
  },
  {
    title: "Suç ve Ceza",
    author: "Fyodor Dostoyevski",
    category: "Klasik",
    publisher: "İş Bankası Yayınları",
    page_count: 671,
    description:
      "İnsan psikolojisinin derinliklerine inen unutulmaz bir başyapıt.",
    cover_image: "https://m.media-amazon.com/images/I/71O2XIytdqL._SL1500_.jpg",
  },
  {
    title: "Simyacı",
    author: "Paulo Coelho",
    category: "Roman",
    publisher: "Can Yayınları",
    page_count: 176,
    description:
      "Kişisel efsaneni gerçekleştirme yolculuğunu anlatan ilham verici bir hikaye.",
    cover_image: "https://m.media-amazon.com/images/I/71aFt4+OTOL._SL1500_.jpg",
  },
  {
    title: "Küçük Prens",
    author: "Antoine de Saint-Exupéry",
    category: "Felsefe",
    publisher: "Can Çocuk Yayınları",
    page_count: 96,
    description: "Sevgi, dostluk ve hayatın anlamı üzerine derin bir masal.",
    cover_image: "https://m.media-amazon.com/images/I/61K9Q6xYz4L._SL1000_.jpg",
  },
  {
    title: "Sefiller",
    author: "Victor Hugo",
    category: "Klasik",
    publisher: "İş Bankası Yayınları",
    page_count: 1463,
    description:
      "19. yüzyıl Fransa'sında adaletsizlik ve merhamet üzerine epik bir roman.",
    cover_image: "https://m.media-amazon.com/images/I/81sG7bhN-FL._SL1500_.jpg",
  },
  {
    title: "Hayvan Çiftliği",
    author: "George Orwell",
    category: "Distopya",
    publisher: "Can Yayınları",
    page_count: 144,
    description: "Totalitarizm eleştirisi yapan alegori bir hikaye.",
    cover_image: "https://m.media-amazon.com/images/I/71wyMAeMnzL._SL1500_.jpg",
  },
  {
    title: "Satranç",
    author: "Stefan Zweig",
    category: "Roman",
    publisher: "İş Bankası Yayınları",
    page_count: 96,
    description:
      "İnsan zihninin karanlık köşelerini keşfeden bir psikolojik gerilim.",
    cover_image: "https://m.media-amazon.com/images/I/81hU0qGK7PL._SL1500_.jpg",
  },
  {
    title: "Fareler ve İnsanlar",
    author: "John Steinbeck",
    category: "Klasik",
    publisher: "İletişim Yayınları",
    page_count: 112,
    description:
      "Büyük Buhran döneminde dostluk ve hayaller üzerine acı bir hikaye.",
    cover_image: "https://m.media-amazon.com/images/I/71k6mCRwJNL._SL1500_.jpg",
  },
  {
    title: "Kürk Mantolu Madonna",
    author: "Sabahattin Ali",
    category: "Türk Edebiyatı",
    publisher: "Yapı Kredi Yayınları",
    page_count: 176,
    description: "Aşk, yalnızlık ve özlem üzerine unutulmaz bir Türk klasiği.",
    cover_image: "https://m.media-amazon.com/images/I/71KYKIEe6xL._SL1500_.jpg",
  },
  {
    title: "Tutunamayanlar",
    author: "Oğuz Atay",
    category: "Türk Edebiyatı",
    publisher: "İletişim Yayınları",
    page_count: 724,
    description: "Modern Türk edebiyatının en önemli eserlerinden biri.",
    cover_image: "https://m.media-amazon.com/images/I/71LXt1RsKDL._SL1500_.jpg",
  },
  {
    title: "İnce Memed",
    author: "Yaşar Kemal",
    category: "Türk Edebiyatı",
    publisher: "Yapı Kredi Yayınları",
    page_count: 420,
    description: "Çukurova'da geçen epik bir direniş hikayesi.",
    cover_image: "https://m.media-amazon.com/images/I/71qiposNlpL._SL1500_.jpg",
  },
  {
    title: "Cesur Yeni Dünya",
    author: "Aldous Huxley",
    category: "Distopya",
    publisher: "İthaki Yayınları",
    page_count: 288,
    description:
      "Teknolojinin insanlığı köleleştirdiği karanlık bir gelecek vizyonu.",
    cover_image: "https://m.media-amazon.com/images/I/81zE42gT3xL._SL1500_.jpg",
  },
];

async function seedBooks() {
  try {
    await sequelize.authenticate();
    console.log("✅ Veritabanı bağlantısı başarılı.");

    const existingCount = await Book.count();
    console.log(`📚 Mevcut kitap sayısı: ${existingCount}`);

    if (existingCount > 0) {
      const answer = require("readline").createInterface({
        input: process.stdin,
        output: process.stdout,
      });

      console.log(
        "⚠️  Veritabanında zaten kitap var. Yine de eklemek istiyor musunuz? (y/n)"
      );
      // For automation, just proceed
    }

    console.log("📥 Kitaplar ekleniyor...");

    for (const bookData of sampleBooks) {
      await Book.create(bookData);
      console.log(`   ✓ ${bookData.title} - ${bookData.author}`);
    }

    console.log(`\n✅ ${sampleBooks.length} kitap başarıyla eklendi!`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Hata:", error);
    process.exit(1);
  }
}

seedBooks();
