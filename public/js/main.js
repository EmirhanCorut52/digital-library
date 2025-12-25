const API_URL = "/api";

function checkAuth() {
  const token = localStorage.getItem("token");
  const path = window.location.pathname;

  const publicPages = ["login.html", "forgot-password", "set-password"];
  const isPublicPage = publicPages.some((page) => path.includes(page));

  if (isPublicPage && token) {
    window.location.href = "index.html";
  } else if (!isPublicPage && !token) {
    window.location.href = "login.html";
  }
}

function logout() {
  if (confirm("Çıkış yapmak istediğinizden emin misiniz?")) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("role");
    window.location.href = "login.html";
  }
}

async function authFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  options.headers = options.headers || {};
  options.headers["Authorization"] = `Bearer ${token}`;
  options.headers["Content-Type"] = "application/json";

  const response = await fetch(`${API_URL}${endpoint}`, options);

  if (response.status === 401 || response.status === 403) {
    alert("Oturumunuzun süresi doldu, lütfen tekrar giriş yapın.");
    localStorage.removeItem("token");
    window.location.href = "login.html";
    return null;
  }

  return response;
}

document.addEventListener("DOMContentLoaded", () => {
  checkAuth();

  const logoutBtns = document.querySelectorAll(".fa-sign-out-alt");
  logoutBtns.forEach((icon) => {
    const link = icon.closest("a") || icon.closest("button");
    if (link) {
      link.onclick = (e) => {
        e.preventDefault();
        logout();
      };
    }
  });
});

document.addEventListener("DOMContentLoaded", () => {
  const searchInputs = document.querySelectorAll(
    'input[placeholder*="ara"], input[placeholder*="Ara"]'
  );

  searchInputs.forEach((input) => {
    if (input.id === "navbar-search") return;

    input.addEventListener("keypress", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        const query = e.target.value.trim();
        if (query) {
          window.location.href = `search-results.html?q=${encodeURIComponent(
            query
          )}`;
        }
      }
    });
  });

  setupNavbarSearchSuggestions();
  ensureRoleThenShortcut();
});

function setupNavbarSearchSuggestions() {
  const input = document.getElementById("navbar-search");
  if (!input) return;

  const wrapper = input.parentElement;
  if (!wrapper) return;
  wrapper.classList.add("relative");

  let box = wrapper.querySelector("[data-suggestion-box]");
  if (!box) {
    box = document.createElement("div");
    box.dataset.suggestionBox = "true";
    box.className =
      "absolute left-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-y-auto text-sm hidden z-50";
    box.style.width = "100%";
    wrapper.appendChild(box);
  }

  let debounceId;
  const hideBox = () => box.classList.add("hidden");
  const showBox = () => box.classList.remove("hidden");

  input.addEventListener("input", () => {
    const query = input.value.trim();
    clearTimeout(debounceId);

    if (!query) {
      box.innerHTML = "";
      hideBox();
      return;
    }

    if (query.length < 2) {
      box.innerHTML =
        '<div class="p-3 text-gray-500 text-sm">En az 2 harf yazın.</div>';
      showBox();
      return;
    }

    box.innerHTML = '<div class="p-3 text-gray-500 text-sm">Aranıyor...</div>';
    showBox();

    debounceId = setTimeout(() => fetchSearchSuggestions(query, box), 250);
  });

  input.addEventListener("focus", () => {
    if (box.innerHTML.trim()) {
      showBox();
    }
  });

  input.addEventListener("blur", () => {
    setTimeout(() => hideBox(), 150);
  });

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const query = input.value.trim();
      if (query) {
        window.location.href = `search-results.html?q=${encodeURIComponent(
          query
        )}`;
      }
    }
  });
}

async function fetchSearchSuggestions(query, box) {
  try {
    const res = await authFetch(`/search?q=${encodeURIComponent(query)}`);
    if (!res || !res.ok) {
      box.innerHTML =
        '<div class="p-3 text-red-500 text-sm">Öneriler alınamadı.</div>';
      return;
    }
    const data = await res.json();
    renderSearchSuggestions(data, box);
  } catch (error) {
    box.innerHTML =
      '<div class="p-3 text-red-500 text-sm">Öneriler alınamadı.</div>';
  }
}

function renderSearchSuggestions(data, box) {
  const books = Array.isArray(data?.books) ? data.books : [];
  const users = Array.isArray(data?.users) ? data.users : [];
  const escapeHtml = (str) =>
    (str || "").replace(/</g, "&lt;").replace(/>/g, "&gt;");

  if (books.length === 0 && users.length === 0) {
    box.innerHTML =
      '<div class="p-3 text-gray-500 text-sm">Sonuç bulunamadı.</div>';
    box.classList.remove("hidden");
    return;
  }

  const bookSection = books
    .slice(0, 5)
    .map((book) => {
      const coverHtml = book.cover_image
        ? `<img src="${book.cover_image}" alt="${escapeHtml(
            book.title
          )}" class="w-10 h-14 object-cover rounded flex-shrink-0" />`
        : '<div class="w-10 h-14 rounded bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0 text-xs"><i class="fas fa-book"></i></div>';
      return `
        <button type="button" class="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-start gap-3" onclick="window.location.href='book-details.html?id=${
          book.book_id
        }'">
          ${coverHtml}
          <div class="min-w-0 flex-1">
            <div class="text-sm font-semibold text-gray-900 truncate">${escapeHtml(
              book.title
            )}</div>
            <div class="text-xs text-gray-500 truncate">${escapeHtml(
              book.category || "Kategori yok"
            )}</div>
          </div>
        </button>
      `;
    })
    .join("");

  const userSection = users
    .slice(0, 5)
    .map(
      (user) => `
        <button type="button" class="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-start gap-2" onclick="window.location.href='user-profile.html?id=${
          user.user_id
        }'">
          <div class="w-9 h-9 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center flex-shrink-0"><i class="fas fa-user"></i></div>
          <div class="min-w-0">
            <div class="text-sm font-semibold text-gray-900 truncate">${escapeHtml(
              user.username
            )}</div>
            <div class="text-xs text-gray-500 truncate">${escapeHtml(
              user.role || "Kullanıcı"
            )}</div>
          </div>
        </button>
      `
    )
    .join("");

  box.innerHTML = `
    <div class="p-2">
      <div class="text-[11px] font-semibold text-gray-500 uppercase px-1 mb-1">Kitaplar</div>
      ${
        bookSection ||
        '<div class="px-3 py-2 text-gray-400 text-sm">Sonuç yok</div>'
      }
      <div class="text-[11px] font-semibold text-gray-500 uppercase px-1 mt-3 mb-1">Kullanıcılar</div>
      ${
        userSection ||
        '<div class="px-3 py-2 text-gray-400 text-sm">Sonuç yok</div>'
      }
    </div>
  `;
  box.classList.remove("hidden");
}

async function ensureRoleThenShortcut() {
  const token = localStorage.getItem("token");
  let role = localStorage.getItem("role");

  if (token && !role) {
    try {
      const res = await authFetch("/auth/me");
      if (res && res.ok) {
        const user = await res.json();
        if (user.role) {
          role = user.role;
          localStorage.setItem("role", role);
        }
        if (user.name || user.username) {
          localStorage.setItem("user_name", user.name || user.username);
        }
        if (user.user_id) {
          localStorage.setItem("user_id", user.user_id);
        }
      }
    } catch (e) {}
  }

  addAdminShortcut();
}

function addAdminShortcut() {
  const role = localStorage.getItem("role");
  if (role !== "admin") return;

  if (document.getElementById("admin-shortcut")) return;

  const btn = document.createElement("a");
  btn.id = "admin-shortcut";
  btn.href = "admin.html";
  btn.title = "Admin Paneli";
  btn.innerHTML = '<i class="fas fa-shield-alt"></i>';
  btn.style.position = "fixed";
  btn.style.right = "16px";
  btn.style.bottom = "16px";
  btn.style.width = "48px";
  btn.style.height = "48px";
  btn.style.borderRadius = "999px";
  btn.style.display = "flex";
  btn.style.alignItems = "center";
  btn.style.justifyContent = "center";
  btn.style.background = "#1d4ed8";
  btn.style.color = "white";
  btn.style.boxShadow = "0 10px 25px rgba(0,0,0,0.12)";
  btn.style.zIndex = "999";
  btn.style.textDecoration = "none";

  btn.addEventListener("mouseenter", () => {
    btn.style.background = "#1e40af";
  });
  btn.addEventListener("mouseleave", () => {
    btn.style.background = "#1d4ed8";
  });

  document.body.appendChild(btn);
}

async function sharePost() {
  const postInput = document.getElementById("post-input");
  const text = postInput.value.trim();

  if (!text) {
    alert("Gönderi metni boş olamaz!");
    return;
  }

  try {
    const payload = { text };
    if (typeof selectedTaggedBook !== "undefined" && selectedTaggedBook) {
      payload.tagged_book_id = selectedTaggedBook.book_id;
    }
    if (typeof selectedTaggedUser !== "undefined" && selectedTaggedUser) {
      payload.tagged_user_id = selectedTaggedUser.user_id;
    }

    const response = await authFetch("/posts/share", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (response && response.ok) {
      alert("Gönderi paylaşıldı!");
      postInput.value = "";
      if (typeof clearBookTag !== "undefined") {
        clearBookTag();
      }
      if (typeof clearUserTag !== "undefined") {
        clearUserTag();
      }
      if (window.getFeed) {
        window.getFeed();
      }
    } else {
      alert("Gönderi paylaşılırken hata oluştu.");
    }
  } catch (error) {
    alert("Gönderi paylaşılırken hata oluştu.");
  }
}

async function login() {
  const email = document.getElementById("login-email").value.trim();
  const password = document.getElementById("login-password").value;

  if (!email || !password) {
    alert("Lütfen e-posta ve şifrenizi girin.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("role", data.user.role);
      localStorage.setItem("user_id", data.user.id);
      localStorage.setItem("user_name", data.user.name || data.user.username);

      window.location.href = "index.html";
    } else {
      alert(data.error || "Giriş başarısız oldu.");
    }
  } catch (error) {
    alert("Giriş sırasında hata oluştu.");
  }
}

async function register() {
  const name = document.getElementById("reg-name").value.trim();
  const username = document.getElementById("reg-username").value.trim();
  const email = document.getElementById("reg-email").value.trim();
  const password = document.getElementById("reg-password").value;

  if (!name || !username || !email || !password) {
    alert("Lütfen tüm alanları doldurun.");
    return;
  }

  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, username, email, password }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Kayıt başarılı! Lütfen giriş yapın.");
      document.getElementById("register-form").reset();
      toggleForm("login");
    } else {
      alert(data.error || "Kayıt başarısız oldu.");
    }
  } catch (error) {
    alert("Kayıt sırasında hata oluştu.");
  }
}
