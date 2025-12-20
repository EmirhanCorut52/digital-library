window.selectedTaggedBook = null;

function showTagMenu() {
  const menu = document.getElementById("tag-menu");
  if (menu) menu.classList.toggle("hidden");
}

function tagBook() {
  const menu = document.getElementById("tag-menu");
  const modal = document.getElementById("book-tag-modal");
  if (menu) menu.classList.add("hidden");
  if (modal) {
    modal.classList.remove("hidden");
    modal.style.display = "flex";
  }
  setConfirmBookButtonState(false);
  const input = document.getElementById("book-search-input");
  if (input) setTimeout(() => input.focus(), 0);
}

function closeBookTagModal() {
  const modal = document.getElementById("book-tag-modal");
  const input = document.getElementById("book-search-input");
  const results = document.getElementById("book-search-results");
  if (modal) {
    modal.classList.add("hidden");
    modal.style.display = "none";
  }
  setConfirmBookButtonState(false);
  if (input) input.value = "";
  if (results) results.innerHTML = "";
}

function confirmBookTag() {
  if (!window.selectedTaggedBook) return;
  renderSelectedBookChip();
  closeBookTagModal();
}

async function searchBooksForTag() {
  const input = document.getElementById("book-search-input");
  const resultsContainer = document.getElementById("book-search-results");
  const query = (input?.value || "").trim();
  if (!resultsContainer) return;
  if (!query) {
    resultsContainer.innerHTML = "";
    return;
  }
  try {
    const res = await fetch(`/api/books/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
      resultsContainer.innerHTML =
        '<p class="text-red-500 text-sm py-4">Arama başarısız.</p>';
      return;
    }
    const data = await res.json();
    const books = Array.isArray(data) ? data : [];
    resultsContainer.innerHTML = "";
    if (!books.length) {
      resultsContainer.innerHTML =
        '<p class="text-gray-500 text-sm py-4">Sonuç bulunamadı</p>';
      return;
    }
    books.forEach((book) => {
      const authorName = Array.isArray(book.Authors)
        ? book.Authors.map((a) => a.full_name).join(", ")
        : book.Author?.full_name || book.authors || "Yazar bilinmiyor";
      const safeTitle = String(book.title || "").replace(/'/g, "\\'");
      const item = document.createElement("div");
      item.className =
        "flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer border-b transition";
      item.onclick = () => selectBookTag(book.book_id, book.title);
      const cover = book.cover_image
        ? `<img src="${book.cover_image}" alt="${safeTitle}" class="w-10 h-14 object-cover rounded flex-shrink-0">`
        : '<div class="w-10 h-14 bg-gray-200 rounded flex-shrink-0"></div>';
      item.innerHTML = `
        ${cover}
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-semibold text-gray-800 truncate">${safeTitle}</h4>
          <p class="text-xs text-gray-500">${authorName}</p>
        </div>
      `;
      resultsContainer.appendChild(item);
    });
  } catch (err) {
    resultsContainer.innerHTML =
      '<p class="text-red-500 text-sm py-4">Arama sırasında hata oluştu.</p>';
  }
}

function selectBookTag(bookId, bookTitle) {
  window.selectedTaggedBook = { book_id: bookId, title: bookTitle };
  const display = document.getElementById("tagged-book-display");
  if (!display) return;
  display.classList.remove("hidden");
  const safeTitle = String(bookTitle || "")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  display.innerHTML = `
    <div class="flex items-center justify-between bg-blue-50 border border-blue-200 rounded-lg p-3">
      <div class="flex items-center gap-2">
        <i class="fas fa-check-circle text-blue-600"></i>
        <span class="text-sm font-medium text-gray-800">${safeTitle}</span>
      </div>
      <button onclick="clearBookTag()" class="text-gray-500 hover:text-gray-700">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  const results = document.getElementById("book-search-results");
  const input = document.getElementById("book-search-input");
  setConfirmBookButtonState(true);
  if (results) results.innerHTML = "";
  if (input) input.value = "";
}

function clearBookTag() {
  window.selectedTaggedBook = null;
  const display = document.getElementById("tagged-book-display");
  if (!display) return;
  display.classList.add("hidden");
  display.innerHTML = "";
  const chip = document.getElementById("post-tagged-book");
  const titleEl = document.getElementById("post-tagged-book-title");
  if (chip) chip.classList.add("hidden");
  if (titleEl) titleEl.textContent = "";
  setConfirmBookButtonState(false);
}

function renderSelectedBookChip() {
  if (!window.selectedTaggedBook) return;
  const chip = document.getElementById("post-tagged-book");
  const titleEl = document.getElementById("post-tagged-book-title");
  if (!chip || !titleEl) return;
  titleEl.textContent = window.selectedTaggedBook.title || "Seçilen kitap";
  chip.classList.remove("hidden");
}

function setConfirmBookButtonState(enabled) {
  const btn = document.getElementById("confirm-book-btn");
  if (!btn) return;
  btn.disabled = !enabled;
  if (enabled) {
    btn.classList.remove(
      "bg-gray-300",
      "text-gray-600",
      "cursor-not-allowed",
      "opacity-70"
    );
    btn.classList.add("bg-blue-600", "hover:bg-blue-700", "text-white");
  } else {
    btn.classList.add(
      "bg-gray-300",
      "text-gray-600",
      "cursor-not-allowed",
      "opacity-70"
    );
    btn.classList.remove("bg-blue-600", "hover:bg-blue-700", "text-white");
  }
}

window.showTagMenu = showTagMenu;
window.tagBook = tagBook;
window.closeBookTagModal = closeBookTagModal;
window.confirmBookTag = confirmBookTag;
window.searchBooksForTag = searchBooksForTag;
window.selectBookTag = selectBookTag;
window.clearBookTag = clearBookTag;
window.setConfirmBookButtonState = setConfirmBookButtonState;
window.renderSelectedBookChip = renderSelectedBookChip;

window.selectedTaggedUser = null;

function tagUser() {
  const menu = document.getElementById("tag-menu");
  const modal = document.getElementById("user-tag-modal");
  if (menu) menu.classList.add("hidden");
  if (modal) {
    modal.classList.remove("hidden");
    modal.style.display = "flex";
  }
  setConfirmUserButtonState(false);
  const input = document.getElementById("user-search-input");
  if (input) setTimeout(() => input.focus(), 0);
}

function closeUserTagModal() {
  const modal = document.getElementById("user-tag-modal");
  const input = document.getElementById("user-search-input");
  const results = document.getElementById("user-search-results");
  if (modal) {
    modal.classList.add("hidden");
    modal.style.display = "none";
  }
  setConfirmUserButtonState(false);
  if (input) input.value = "";
  if (results) results.innerHTML = "";
}

function confirmUserTag() {
  if (!window.selectedTaggedUser) return;
  renderSelectedUserChip();
  closeUserTagModal();
}

async function searchUsersForTag() {
  const input = document.getElementById("user-search-input");
  const resultsContainer = document.getElementById("user-search-results");
  const query = (input?.value || "").trim();
  if (!resultsContainer) return;
  if (!query) {
    resultsContainer.innerHTML = "";
    return;
  }
  try {
    const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    if (!res.ok) {
      resultsContainer.innerHTML =
        '<p class="text-red-500 text-sm py-4">Arama başarısız.</p>';
      return;
    }
    const data = await res.json();
    const users = Array.isArray(data?.users) ? data.users : [];
    resultsContainer.innerHTML = "";
    if (!users.length) {
      resultsContainer.innerHTML =
        '<p class="text-gray-500 text-sm py-4">Sonuç bulunamadı</p>';
      return;
    }
    users.forEach((user) => {
      const uname = String(user.username || "");
      const item = document.createElement("div");
      item.className =
        "flex items-center gap-3 p-3 hover:bg-gray-100 cursor-pointer border-b transition";
      item.onclick = () => selectUserTag(user.user_id, uname);
      const initials = uname.substring(0, 2).toUpperCase();
      item.innerHTML = `
        <div class="w-10 h-10 bg-emerald-50 border border-emerald-200 rounded-full flex items-center justify-center font-bold text-emerald-700">${initials}</div>
        <div class="flex-1 min-w-0">
          <h4 class="text-sm font-semibold text-gray-800 truncate">${uname}</h4>
          <p class="text-xs text-gray-500">@${uname}</p>
        </div>
      `;
      resultsContainer.appendChild(item);
    });
  } catch (err) {
    resultsContainer.innerHTML =
      '<p class="text-red-500 text-sm py-4">Arama sırasında hata oluştu.</p>';
  }
}

function selectUserTag(userId, username) {
  window.selectedTaggedUser = { user_id: userId, username };
  const display = document.getElementById("tagged-user-display");
  if (!display) return;
  display.classList.remove("hidden");
  display.innerHTML = `
    <div class="flex items-center justify-between bg-emerald-100 border border-emerald-400 rounded-lg p-3" style="background-color:#d1fae5;border-color:#34d399;">
      <div class="flex items-center gap-2">
        <i class="fas fa-check-circle text-emerald-600"></i>
        <span class="text-sm font-medium text-gray-800">@${username}</span>
      </div>
      <button onclick="clearUserTag()" class="text-gray-500 hover:text-gray-700">
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;
  const results = document.getElementById("user-search-results");
  const input = document.getElementById("user-search-input");
  setConfirmUserButtonState(true);
  if (results) results.innerHTML = "";
  if (input) input.value = "";
}

function clearUserTag() {
  window.selectedTaggedUser = null;
  const display = document.getElementById("tagged-user-display");
  if (!display) return;
  display.classList.add("hidden");
  display.innerHTML = "";
  const chip = document.getElementById("post-tagged-user");
  const titleEl = document.getElementById("post-tagged-user-name");
  if (chip) chip.classList.add("hidden");
  if (titleEl) titleEl.textContent = "";
  setConfirmUserButtonState(false);
}

function renderSelectedUserChip() {
  if (!window.selectedTaggedUser) return;
  const chip = document.getElementById("post-tagged-user");
  const titleEl = document.getElementById("post-tagged-user-name");
  if (!chip || !titleEl) return;
  titleEl.textContent =
    "@" + (window.selectedTaggedUser.username || "seçilen kullanıcı");
  chip.classList.remove("hidden");
}

function setConfirmUserButtonState(enabled) {
  const btn = document.getElementById("confirm-user-btn");
  if (!btn) return;
  btn.disabled = !enabled;
  if (enabled) {
    btn.classList.remove(
      "bg-gray-300",
      "text-gray-600",
      "cursor-not-allowed",
      "opacity-70"
    );
    btn.classList.add("bg-blue-600", "hover:bg-blue-700", "text-white");
  } else {
    btn.classList.add(
      "bg-gray-300",
      "text-gray-600",
      "cursor-not-allowed",
      "opacity-70"
    );
    btn.classList.remove("bg-blue-600", "hover:bg-blue-700", "text-white");
  }
}

window.tagUser = tagUser;
window.closeUserTagModal = closeUserTagModal;
window.confirmUserTag = confirmUserTag;
window.searchUsersForTag = searchUsersForTag;
window.selectUserTag = selectUserTag;
window.clearUserTag = clearUserTag;
window.setConfirmUserButtonState = setConfirmUserButtonState;
window.renderSelectedUserChip = renderSelectedUserChip;
