document.addEventListener("DOMContentLoaded", () => {
  checkAdminAuth();
  loadAdminInfo();
  loadDashboardStats();
  loadBooks();
  loadUsers();
});

function showSection(sectionId) {
  document.getElementById("section-dashboard").classList.add("hidden");
  document.getElementById("section-books").classList.add("hidden");
  document.getElementById("section-users").classList.add("hidden");

  document.getElementById("section-" + sectionId).classList.remove("hidden");

  const titles = {
    dashboard: "Genel Bakış",
    books: "Kitap Yönetimi",
    users: "Kullanıcı Yönetimi",
    moderation: "İçerik Moderasyonu",
  };
  document.getElementById("page-title").innerText = titles[sectionId];

  document.querySelectorAll("aside nav button").forEach((btn) => {
    btn.classList.remove("active-nav", "bg-slate-800");
  });
  document.getElementById("btn-" + sectionId).classList.add("active-nav");
}

function checkAdminAuth() {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "login.html";
  }
}

async function loadAdminInfo() {
  try {
    const res = await authFetch("/auth/me");
    if (!res) return;
    const user = await res.json();
    document.getElementById("admin-name").innerText =
      user.name || user.username || "Yönetici";
    document.getElementById("admin-email").innerText = user.email || "";
  } catch (error) {
    const name = localStorage.getItem("user_name") || "Yönetici";
    document.getElementById("admin-name").innerText = name;
    document.getElementById("admin-email").innerText = "";
  }
}

async function loadDashboardStats() {
  try {
    const response = await authFetch("/admin/stats");
    if (!response) return;
    const data = await response.json();

    document.getElementById("stat-books").innerText = data.books || 0;
    document.getElementById("stat-users").innerText = data.users || 0;
    document.getElementById("stat-posts").innerText = data.posts || 0;
    document.getElementById("stat-comments").innerText = data.comments || 0;
  } catch (error) {
    console.error(error);
  }
}

async function loadBooks() {
  const tbody = document.getElementById("books-table-body");
  try {
    const response = await authFetch("/books");
    if (!response) return;
    const books = await response.json();

    tbody.innerHTML = "";
    if (books.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" class="p-4 text-center text-gray-500">Kütüphanede kitap yok.</td></tr>';
      return;
    }

    books.forEach((book) => {
      const coverHtml = book.cover_image
        ? `<img src="${book.cover_image}" alt="${book.title}" class="w-12 h-16 object-cover rounded">`
        : '<div class="w-12 h-16 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs"><i class="fas fa-book"></i></div>';

      const authorName =
        book.author ||
        (book.Authors && book.Authors.length > 0
          ? book.Authors.map((a) => a.full_name).join(", ")
          : "Bilinmeyen");

      const html = `
                    <tr class="hover:bg-gray-50 transition border-b">
                        <td class="p-4">${coverHtml}</td>
                        <td class="p-4 text-gray-500">#${book.book_id}</td>
                        <td class="p-4 font-semibold text-gray-800">${book.title}</td>
                        <td class="p-4 text-gray-600">${authorName}</td>
                        <td class="p-4"><span class="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs font-semibold">${book.category}</span></td>
                        <td class="p-4 text-center">
                            <button onclick="kitapSil(${book.book_id})" class="text-red-500 hover:text-red-700 mx-1 p-2 transition" title="Sil">
                                <i class="fas fa-trash-alt"></i>
                            </button>
                        </td>
                    </tr>`;
      tbody.innerHTML += html;
    });
  } catch (error) {
    console.error(error);
  }
}

function searchBooksAdmin() {
  const searchInput = document.getElementById("book-search-admin");
  const query = (searchInput?.value || "").trim().toLowerCase();
  const tbody = document.getElementById("books-table-body");
  const rows = tbody.querySelectorAll("tr");

  rows.forEach((row) => {
    const titleCell = row.querySelector("td:nth-child(3)");
    const authorCell = row.querySelector("td:nth-child(4)");
    const categoryCell = row.querySelector("td:nth-child(5)");

    if (!titleCell || !authorCell) {
      row.style.display = "table-row";
      return;
    }

    const title = titleCell.textContent.toLowerCase();
    const author = authorCell.textContent.toLowerCase();
    const category = categoryCell.textContent.toLowerCase();

    if (
      title.includes(query) ||
      author.includes(query) ||
      category.includes(query)
    ) {
      row.style.display = "table-row";
    } else {
      row.style.display = "none";
    }
  });
}

async function loadUsers() {
  const tbody = document.getElementById("users-table-body");
  try {
    const response = await authFetch("/admin/users");
    if (!response) return;

    const users = await response.json();
    tbody.innerHTML = "";

    if (!Array.isArray(users) || users.length === 0) {
      tbody.innerHTML =
        '<tr><td colspan="5" class="p-4 text-center text-gray-500">Kayıtlı kullanıcı bulunamadı.</td></tr>';
      return;
    }

    users.forEach((user) => {
      const name = user.name || user.username;
      const initials = (name || "?").substring(0, 2).toUpperCase();
      const role = user.role || "-";
      const email = user.email || "-";
      const roleOptions = ["user", "admin"]
        .map(
          (r) =>
            `<option value="${r}" ${r === role ? "selected" : ""}>${r}</option>`
        )
        .join("");

      const row = `
              <tr class="hover:bg-gray-50 transition border-b">
                <td class="p-4 border-b flex items-center gap-3">
                  <div class="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">${initials}</div>
                  <span class="font-semibold">${name}</span>
                </td>
                <td class="p-4 border-b text-gray-500">${email}</td>
                <td class="p-4 border-b">
                  <select class="border rounded px-2 py-1 text-sm" onchange="updateUserRole(${user.user_id}, this.value)">
                    ${roleOptions}
                  </select>
                </td>
                <td class="p-4 border-b text-gray-500">Aktif</td>
                <td class="p-4 border-b text-center flex gap-2 justify-center">
                  <button onclick="deleteUser(${user.user_id}, '${name}')" class="text-red-500 hover:text-red-700 p-2 transition" title="Sil">
                    <i class="fas fa-trash-alt"></i>
                  </button>
                </td>
              </tr>`;
      tbody.innerHTML += row;
    });
  } catch (error) {
    console.error(error);
    tbody.innerHTML =
      '<tr><td colspan="5" class="p-4 text-center text-red-500">Kullanıcılar yüklenemedi.</td></tr>';
  }
}

async function updateUserRole(userId, role) {
  try {
    const response = await authFetch(`/admin/users/${userId}/role`, {
      method: "PUT",
      body: JSON.stringify({ role }),
    });

    if (!response) return;
    if (!response.ok) {
      const data = await response.json();
      alert(data.error || "Rol güncellenemedi.");
      loadUsers();
      return;
    }

    loadUsers();
  } catch (error) {
    console.error(error);
    alert("Rol güncellenemedi.");
    loadUsers();
  }
}

async function deleteUser(userId, userName) {
  if (
    !confirm(
      `"${userName}" kullanıcısını silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`
    )
  ) {
    return;
  }

  try {
    const response = await authFetch(`/admin/users/${userId}`, {
      method: "DELETE",
    });

    if (!response) return;
    if (!response.ok) {
      const data = await response.json();
      alert(data.error || "Kullanıcı silinemedi.");
      return;
    }

    alert("Kullanıcı başarıyla silindi.");
    loadUsers();
  } catch (error) {
    console.error(error);
    alert("Kullanıcı silinirken hata oluştu.");
  }
}

async function kitapEkleModal() {
  const modal = document.getElementById("add-book-modal");
  modal.classList.remove("hidden");
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
  document.getElementById("add-book-form").reset();
  setTimeout(() => document.getElementById("book-title").focus(), 0);
}

function closeAddBookModal() {
  const modal = document.getElementById("add-book-modal");
  modal.classList.add("hidden");
  modal.style.display = "none";
  document.body.style.overflow = "";
  document.getElementById("add-book-form").reset();
}

document
  .getElementById("add-book-form")
  .addEventListener("submit", async (e) => {
    e.preventDefault();

    const title = document.getElementById("book-title").value.trim();
    const authorInputs = document.querySelectorAll(".author-input");
    const authors = Array.from(authorInputs)
      .map((input) => input.value.trim())
      .filter((s) => s.length > 0);
    const category = document.getElementById("book-category").value.trim();
    const publisher = document.getElementById("book-publisher").value.trim();
    const pageCount =
      parseInt(document.getElementById("book-page-count").value) || 0;
    const description = document
      .getElementById("book-description")
      .value.trim();
    const coverImage = document.getElementById("book-cover-image").value.trim();

    if (!title) {
      alert("Lütfen kitap adını girin!");
      return;
    }

    const submitBtn = document.querySelector(
      "#add-book-form button[type='submit']"
    );
    const originalText = submitBtn.innerHTML;
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Ekleniyor...';

    try {
      const response = await authFetch("/books/add", {
        method: "POST",
        body: JSON.stringify({
          title: title,
          authors: authors,
          category: category || null,
          publisher: publisher || null,
          page_count: pageCount,
          description: description || null,
          cover_image: coverImage || null,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Kitap başarıyla eklendi!");
        closeAddBookModal();
        loadBooks();
        loadDashboardStats();
      } else {
        alert("Hata: " + (data.error || "Bilinmeyen hata"));
      }
    } catch (error) {
      console.error("Bağlantı Hatası:", error);
      alert("Sunucuya bağlanılamadı. Lütfen daha sonra tekrar deneyin.");
    } finally {
      submitBtn.disabled = false;
      submitBtn.innerHTML = originalText;
    }
  });

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeAddBookModal();
  }
});

async function kitapSil(id) {
  if (!confirm("Silmek istediğinize emin misiniz?")) return;
  try {
    const response = await authFetch(`/books/${id}`, {
      method: "DELETE",
    });
    if (response.ok) {
      loadBooks();
      loadDashboardStats();
    } else {
      alert("Silinemedi.");
    }
  } catch (error) {
    console.error(error);
  }
}

function logout() {
  if (confirm("Çıkış yapmak istediğinize emin misiniz?")) {
    localStorage.clear();
    window.location.href = "login.html";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  const authorInputsDiv = document.getElementById("author-inputs");
  const addAuthorBtn = document.getElementById("add-author-btn");
  if (addAuthorBtn && authorInputsDiv) {
    addAuthorBtn.addEventListener("click", function () {
      const input = document.createElement("input");
      input.type = "text";
      input.name = "author";
      input.className =
        "author-input w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:border-blue-500 mb-2";
      input.placeholder = "Yazar adı";
      authorInputsDiv.appendChild(input);
    });
  }
});
