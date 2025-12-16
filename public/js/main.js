const API_URL = "/api";

function checkAuth() {
  const token = localStorage.getItem("token");
  const path = window.location.pathname;

  // Public pages that don't require authentication
  const publicPages = ["login.html", "forgot-password", "set-password"];
  const isPublicPage = publicPages.some((page) => path.includes(page));

  if (isPublicPage && token) {
    // If user is logged in and tries to access public pages, redirect to home
    window.location.href = "index.html";
  } else if (!isPublicPage && !token) {
    // If user is not logged in and tries to access protected pages, redirect to login
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

  ensureRoleThenShortcut();
});

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
    } catch (e) {
      // ignore
    }
  }

  addAdminShortcut();
}

function addAdminShortcut() {
  const role = localStorage.getItem("role");
  if (role !== "admin") return;

  // Create a small floating admin button if one doesn't exist
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
    const response = await authFetch("/posts/share", {
      method: "POST",
      body: JSON.stringify({ text }),
    });

    if (response && response.ok) {
      alert("Gönderi paylaşıldı!");
      postInput.value = "";
      if (window.getFeed) {
        window.getFeed();
      }
    } else {
      alert("Gönderi paylaşılırken hata oluştu.");
    }
  } catch (error) {
    console.error("Sharing error:", error);
    alert("Gönderi paylaşılırken hata oluştu.");
  }
}

function tagBook() {
  alert("Kitap etiketleme özelliği yakında eklenecek.");
}
