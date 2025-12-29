let currentAuthorId = null;

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  currentAuthorId = urlParams.get("id");

  if (!currentAuthorId) {
    alert("Yazar seçilmedi!");
    window.location.href = "index.html";
    return;
  }

  loadAuthorBooks();
});

async function loadAuthorBooks() {
  try {
    const response = await authFetch(`/authors/${currentAuthorId}/books`);
    if (!response) return;

    const author = await response.json();

    document.getElementById("author-name").innerText = author.full_name;
    document.getElementById("book-count").innerText = author.Books.length;
    document.title = `${author.full_name} - Kitapları`;

    renderBooks(author.Books || []);
  } catch (error) {
    console.error(error);
    document.getElementById("author-name").innerText = "Yazar Bulunamadı";
  }
}

function renderBooks(books) {
  const container = document.getElementById("books-container");
  container.innerHTML = "";

  if (books.length === 0) {
    container.innerHTML =
      '<p class="text-gray-500 col-span-full">Bu yazara ait kitap bulunamadı.</p>';
    return;
  }

  books.forEach((book) => {
    const coverHtml = book.cover_image
      ? `<img src="${book.cover_image}" alt="${book.title}" class="w-full h-72 object-cover">`
      : '<div class="w-full h-72 bg-gray-200 flex items-center justify-center text-gray-400"><i class="fas fa-book text-6xl"></i></div>';

    const html = `
            <a href="book-details.html?id=${
              book.book_id
            }" class="bg-white rounded-lg shadow hover:shadow-xl transition overflow-hidden group">
              ${coverHtml}
              <div class="p-4">
                <h3 class="font-bold text-lg text-gray-900 group-hover:text-blue-600 line-clamp-2">
                  ${book.title}
                </h3>
                <p class="text-sm text-gray-500 mt-2">${
                  book.category || "Kategori yok"
                }</p>
                <div class="flex justify-between items-center mt-3">
                  <span class="text-xs text-gray-400">${
                    book.page_count || "-"
                  } sayfa</span>
                  <span class="text-blue-600 text-sm font-semibold group-hover:underline">Detayları Gör →</span>
                </div>
              </div>
            </a>
          `;
    container.innerHTML += html;
  });
}
