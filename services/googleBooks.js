const https = require("https");

function buildGoogleBooksUrl({
  q,
  maxResults = 20,
  startIndex = 0,
  apiKey,
  langRestrict = null,
  hl = null,
}) {
  const params = new URLSearchParams();
  params.set("q", q);
  params.set("maxResults", String(Math.min(Math.max(maxResults, 1), 40)));
  if (Number.isFinite(startIndex) && startIndex > 0)
    params.set("startIndex", String(startIndex));
  if (langRestrict) params.set("langRestrict", langRestrict);
  if (hl) params.set("hl", hl);
  if (apiKey) params.set("key", apiKey);
  return `https://www.googleapis.com/books/v1/volumes?${params.toString()}&key=AIzaSyBfBqYYB_6mfnvbyDSmsgn_TlpL1-Fq95M`;
}

function httpsGetJson(url, retries = 3, delay = 1000) {
  return new Promise((resolve, reject) => {
    const attempt = (attemptsLeft) => {
      https
        .get(url, (res) => {
          const statusCode = res.statusCode || 0;

          if ((statusCode === 429 || statusCode === 503) && attemptsLeft > 0) {
            res.resume();
            console.warn(
              `Rate limited (${statusCode}), retrying in ${delay}ms...`
            );
            setTimeout(() => attempt(attemptsLeft - 1), delay);
            return;
          }

          if (statusCode < 200 || statusCode >= 300) {
            reject(new Error(`HTTP ${statusCode} for ${url}`));
            res.resume();
            return;
          }

          let raw = "";
          res.on("data", (chunk) => (raw += chunk));
          res.on("end", () => {
            try {
              const json = JSON.parse(raw);
              resolve(json);
            } catch (err) {
              reject(err);
            }
          });
        })
        .on("error", (err) => {
          if (attemptsLeft > 0) {
            setTimeout(() => attempt(attemptsLeft - 1), delay);
          } else {
            reject(err);
          }
        });
    };
    attempt(retries);
  });
}

function normalizeImageUrl(url) {
  if (!url) return null;
  let safe = url.replace(/^http:\/\//i, "https://");
  safe = safe.replace(/smallThumbnail/i, "thumbnail");
  if (!safe.startsWith("https://")) return null;
  return safe;
}

function cleanAuthorName(name) {
  if (!name) return null;
  let cleaned = String(name).trim();
  cleaned = cleaned.replace(/[^\w\s\-'.áéíóúäëïöüàèìòùâêîôûãõñçü]/gi, "");
  if (cleaned.length > 255) {
    cleaned = cleaned.substring(0, 252) + "...";
  }
  return cleaned || null;
}

function mapVolumeToBook(volume) {
  const vi = volume?.volumeInfo || {};
  const imageLinks = vi.imageLinks || {};
  const authors = Array.isArray(vi.authors) ? vi.authors : [];
  const categories = Array.isArray(vi.categories) ? vi.categories : [];

  const cover = normalizeImageUrl(
    imageLinks.thumbnail || imageLinks.smallThumbnail || null
  );

  const description = (vi.description || vi.subtitle || "").trim();

  return {
    title: (vi.title || "").trim() || null,
    authors: authors.map(cleanAuthorName).filter((a) => a),
    category: categories.find((c) => c && String(c).trim()) || null,
    publisher: (vi.publisher || "").trim() || null,
    page_count: vi.pageCount || null,
    description: description || null,
    cover_image: cover,
    _raw: { id: volume.id, volumeInfo: vi },
  };
}

async function searchVolumes({
  q,
  maxResults = 20,
  startIndex = 0,
  apiKey,
  langRestrict = null,
  hl = null,
}) {
  if (!q || !String(q).trim()) return [];
  const url = buildGoogleBooksUrl({
    q: String(q).trim(),
    maxResults,
    startIndex,
    apiKey,
    langRestrict,
    hl,
  });
  const json = await httpsGetJson(url);
  const items = Array.isArray(json.items) ? json.items : [];
  return items.map(mapVolumeToBook).filter((b) => !!b.title);
}

module.exports = {
  searchVolumes,
  normalizeImageUrl,
};
