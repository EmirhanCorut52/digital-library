const axios = require("axios");

const API_URL = process.env.GOOGLE_BOOKS_API_URL;

const API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

exports.searchBooks = async (query, maxResults = 10) => {
  try {
    const params = {
      q: query,
      maxResults: maxResults,
      key: API_KEY,
      printType: "books",
      langRestrict: "tr",
    };

    const response = await axios.get(API_URL, { params });
    const items = response.data.items || [];

    const mappedBooks = items.map((item) => {
      const info = item.volumeInfo;

      let coverImage = null;
      if (info.imageLinks) {
        coverImage = (
          info.imageLinks.thumbnail ||
          info.imageLinks.smallThumbnail ||
          ""
        ).replace("http://", "https://");
      }

      return {
        google_id: item.id,
        title: info.title || "İsimsiz Kitap",
        authors: info.authors || [],
        description: info.description || "",
        publisher: info.publisher || "",
        published_date: info.publishedDate || "",
        page_count: info.pageCount || 0,
        category: info.categories ? info.categories[0] : "Genel",
        cover_image: coverImage,
        isbn: info.industryIdentifiers
          ? info.industryIdentifiers.find((id) => id.type === "ISBN_13")
              ?.identifier
          : null,
      };
    });

    return mappedBooks;
  } catch (error) {
    console.error("Google API Hatası:", error.message);
    return [];
  }
};
