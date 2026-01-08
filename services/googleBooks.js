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
    };

    const response = await axios.get(API_URL, { params });
    const items = (response.data.items || []).filter((item) => {
      const info = item?.volumeInfo || {};
      const hasTitle = !!info.title;
      const hasAuthors = Array.isArray(info.authors) && info.authors.length > 0;
      const hasDescription = !!info.description;
      const descIsTurkish = hasDescription && isLikelyTurkish(info.description);
      return hasTitle && hasAuthors && descIsTurkish;
    });

    const mappedBooks = await Promise.all(
      items.map(async (item) => {
        const info = item.volumeInfo;

        let coverImage = null;
        if (info.imageLinks) {
          coverImage = (
            info.imageLinks.thumbnail ||
            info.imageLinks.smallThumbnail ||
            ""
          ).replace("http://", "https://");
        }

        const rawCategory = info.categories ? info.categories[0] : null;
        const category = formatCategory(rawCategory);

        return {
          google_id: item.id,
          title: info.title || "İsimsiz Kitap",
          authors: info.authors || [],
          description: info.description || "",
          publisher: info.publisher || "",
          published_date: info.publishedDate || "",
          page_count: info.pageCount || 0,
          category: category,
          cover_image: coverImage,
        };
      })
    );

    return mappedBooks;
  } catch (error) {
    console.error("Google API Hatası:", error.message);
    return [];
  }
};

function formatCategory(raw) {
  if (!raw) return "Genel";
  return String(raw).split("/")[0].trim();
}

function isLikelyTurkish(text) {
  if (!text) return false;
  const turkishChars = /[çğıöşüÇĞİÖŞÜ]/g;
  const matches = text.match(turkishChars) || [];
  return matches.length >= 1;
}
