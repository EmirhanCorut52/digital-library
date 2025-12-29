let currentBookId = null;

document.addEventListener("DOMContentLoaded", () => {
  const urlParams = new URLSearchParams(window.location.search);
  currentBookId = urlParams.get("id");

  if (!currentBookId) {
    alert("Kitap seçilmedi!");
    window.location.href = "index.html";
    return;
  }

  loadBookDetails();
  setRating(0);
});

async function loadBookDetails() {
  try {
    const response = await authFetch(`/books/${currentBookId}`);
    if (!response) return;
    if (!response.ok) {
      let err;
      try {
        err = await response.json();
      } catch (_) {
        err = {};
      }
      console.error("Book details error", err);
      document.getElementById("book-title").innerText =
        err.error || "Kitap Bulunamadı";
      return;
    }

    const book = await response.json();

    document.title = `${book.title} - Kitap Detayı`;
    document.getElementById("book-title").innerText = book.title;

    const authorContainer = document.getElementById("book-author");
    if (book.Authors && book.Authors.length > 0) {
      authorContainer.innerHTML = book.Authors.map(
        (author) =>
          `<a href="author-books.html?id=${author.author_id}" 
                 class="text-xl text-blue-600 font-semibold hover:underline">
                ${author.full_name}
              </a>`
      ).join(", ");
    } else {
      authorContainer.innerHTML =
        '<span class="text-xl text-gray-500">Yazar bilgisi yok</span>';
    }

    document.getElementById("book-desc").innerText =
      book.description || "Açıklama yok.";
    document.getElementById("book-category").innerText =
      book.category || "Kategori yok";
    document.getElementById("book-page").innerText = book.page_count || "-";
    document.getElementById("book-publisher").innerText = book.publisher || "-";

    if (book.cover_image) {
      const coverImg = document.getElementById("book-cover");
      const placeholder = document.getElementById("book-cover-placeholder");
      coverImg.src = book.cover_image;
      coverImg.classList.remove("hidden");
      placeholder.classList.add("hidden");
    }

    renderComments(book.Comments || []);
  } catch (error) {
    console.error(error);
    document.getElementById("book-title").innerText = "Kitap Bulunamadı";
  }
}

function renderComments(comments) {
  const container = document.getElementById("comments-container");
  document.getElementById("comment-count").innerText = comments.length;

  container.innerHTML = "";

  if (comments.length === 0) {
    container.innerHTML =
      '<p class="text-gray-500">Henüz yorum yapılmamış. İlk yorumu sen yap!</p>';
    return;
  }

  let totalRating = 0;

  comments.forEach((comment) => {
    totalRating += comment.rating;
    const tarih = new Date(comment.created_at).toLocaleDateString("tr-TR");
    const user = comment.User || {
      name: "Anonim",
      username: "anonim",
    };
    const basHarfler = user.username.substring(0, 2).toUpperCase();

    let starsHtml = "";
    for (let i = 0; i < 5; i++) {
      if (i < comment.rating)
        starsHtml += '<i class="fas fa-star text-yellow-400"></i>';
      else starsHtml += '<i class="far fa-star text-gray-300"></i>';
    }

    const html = `
                <div class="bg-white rounded-lg shadow-sm p-6 mb-4 border border-gray-100">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600 uppercase">${basHarfler}</div>
                            <div>
                                <h4 class="font-bold text-sm">${user.username}</h4>
                                <div class="flex text-xs mt-1">
                                    ${starsHtml}
                                </div>
                            </div>
                        </div>
                        <span class="text-xs text-gray-400">${tarih}</span>
                    </div>
                    <p class="text-gray-700 text-sm">${comment.comment_text}</p>
                </div>
                `;
    container.innerHTML += html;
  });

  if (comments.length > 0) {
    const ortalama = (totalRating / comments.length).toFixed(1);
    document.getElementById("book-rating").innerText = ortalama;
  }
}

function setRating(rating) {
  document.getElementById("puan-input").value = rating;
  updateStarDisplay(rating);
}

function updateStarDisplay(rating) {
  const btns = document.querySelectorAll(".star-btn");
  btns.forEach((btn, index) => {
    if (index < rating) {
      btn.classList.remove("text-gray-300");
      btn.classList.add("text-yellow-400");
    } else {
      btn.classList.add("text-gray-300");
      btn.classList.remove("text-yellow-400");
    }
  });
}

document.addEventListener("DOMContentLoaded", () => {
  const starBtns = document.querySelectorAll(".star-btn");
  starBtns.forEach((btn, index) => {
    btn.addEventListener("mouseenter", () => {
      updateStarDisplay(index + 1);
    });
  });

  const starContainer = document.getElementById("star-container");
  starContainer.addEventListener("mouseleave", () => {
    const currentRating = document.getElementById("puan-input").value;
    updateStarDisplay(currentRating);
  });
});

async function addComment(e) {
  e.preventDefault();

  const metin = document.getElementById("yorum-metni").value;
  const rating = document.getElementById("puan-input").value;
  const btn = e.target.querySelector('button[type="submit"]');

  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = "Gönderiliyor...";

  try {
    const response = await authFetch(
      `/comments/books/${currentBookId}/comment`,
      {
        method: "POST",
        body: JSON.stringify({
          comment_text: metin,
          rating: parseInt(rating),
        }),
      }
    );

    if (response.ok) {
      alert("Yorumunuz eklendi!");
      document.getElementById("yorum-metni").value = "";
      loadBookDetails();
    } else {
      const errorData = await response.json();
      alert("Hata oluştu: " + (errorData.error || "Bilinmeyen hata"));
    }
  } catch (error) {
    console.error(error);
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}
