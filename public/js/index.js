document.addEventListener("DOMContentLoaded", () => {
  getProfileInfo();
  getFeed();
  getLatestBooks();
});

let currentFeed = "all";

function switchFeed(feedType) {
  currentFeed = feedType;
  const allTab = document.getElementById("all-feed-tab");
  const followingTab = document.getElementById("following-feed-tab");

  if (feedType === "all") {
    allTab.classList.add("bg-blue-600", "text-white");
    allTab.classList.remove("text-gray-600", "hover:bg-gray-100");
    followingTab.classList.remove("bg-blue-600", "text-white");
    followingTab.classList.add("text-gray-600", "hover:bg-gray-100");
    getFeed();
  } else {
    followingTab.classList.add("bg-blue-600", "text-white");
    followingTab.classList.remove("text-gray-600", "hover:bg-gray-100");
    allTab.classList.remove("bg-blue-600", "text-white");
    allTab.classList.add("text-gray-600", "hover:bg-gray-100");
    getFollowingFeed();
  }
}

async function getFollowingFeed() {
  const container = document.getElementById("feed-container");
  try {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const currentUserId = currentUser?.id;
    const currentUserRole = localStorage.getItem("role");
    const response = await authFetch("/posts/feed/following");
    if (!response) return;
    const posts = await response.json();
    container.innerHTML = "";
    if (posts.length === 0) {
      container.innerHTML =
        '<div class="text-center py-12 bg-white rounded-lg shadow"><i class="fas fa-users text-5xl text-gray-300 mb-4"></i><p class="text-gray-500 text-lg font-medium">Takip ettiğiniz kişilerden henüz gönderi yok</p><p class="text-gray-400 text-sm mt-2">Yeni kullanıcıları takip edin!</p></div>';
      return;
    }

    posts.forEach((post) => {
      const date = new Date(post.created_at).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const initials = post.User.username.substring(0, 2).toUpperCase();
      const likeCount = post.likeCount || 0;
      const commentCount = post.commentCount || 0;
      const isLiked = !!post.isLiked;

      const chips = [];
      if (post.Book) {
        const bookCover = post.Book.cover_image
          ? `<img src="${post.Book.cover_image}" alt="${post.Book.title}" class="w-8 h-11 object-cover rounded" />`
          : '<div class="w-8 h-11 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs"><i class="fas fa-book"></i></div>';
        chips.push(`
              <div class="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs font-semibold text-gray-800 cursor-pointer hover:opacity-80 transition" onclick="window.location.href='book-details.html?id=${post.Book.book_id}'">
                ${bookCover}
                <span class="truncate max-w-[200px]">${post.Book.title}</span>
              </div>
            `);
      }
      if (post.TaggedUser) {
        chips.push(`
              <div class="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xs font-semibold text-gray-800 cursor-pointer hover:opacity-80 transition" onclick="window.location.href='user-profile.html?id=${post.TaggedUser.user_id}'">
                <i class="fas fa-user text-emerald-600"></i>
                <span>@${post.TaggedUser.username}</span>
              </div>
            `);
      }

      const html = `
            <div class="bg-white rounded-lg shadow p-4 relative">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600">${initials}</div>
                  <div class="leading-tight">
                    <div class="cursor-pointer" onclick="window.location.href='user-profile.html?id=${
                      post.User.user_id
                    }'">
                      <h4 class="font-bold text-sm hover:text-blue-600 transition">${
                        post.User.username
                      }</h4>
                      <p class="text-xs text-gray-500">${date}</p>
                    </div>
                  </div>
                </div>
                ${
                  post.User.user_id === currentUserId ||
                  currentUserRole === "admin"
                    ? `<button onclick="deletePost(${post.post_id})" class="text-gray-400 hover:text-red-500"><i class="fas fa-trash"></i></button>`
                    : ""
                }
              </div>
              <p class="text-gray-800 mb-3 whitespace-pre-line">${escapeHtml(
                post.post_text
              )}</p>
              ${
                chips.length
                  ? `<div class="flex flex-wrap gap-2 mb-3">${chips.join(
                      ""
                    )}</div>`
                  : ""
              }
              <div class="flex items-center gap-6 text-gray-500 text-sm border-t pt-3 mt-3">
                <button class="flex items-center gap-2 transition" aria-label="Beğen" onclick="toggleLike(${
                  post.post_id
                }, this)">
                  <i class="${isLiked ? "fas" : "far"} fa-heart ${
        isLiked ? "text-red-500" : ""
      }"></i>
                  <span class="like-label ${isLiked ? "text-red-500" : ""}">${
        isLiked ? "Beğenildi" : "Beğen"
      }</span>
                  <span class="like-count">${likeCount}</span>
                </button>
                <button class="flex items-center gap-2 hover:text-blue-500 transition" aria-label="Yorum yap" onclick="toggleComments(${
                  post.post_id
                })">
                  <i class="far fa-comment"></i>
                  <span>Yorum</span>
                  <span class="comment-count">${commentCount}</span>
                </button>
              </div>
                <div id="comments-${
                  post.post_id
                }" class="hidden mt-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div class="flex gap-2 mb-3">
                    <textarea id="comment-input-${
                      post.post_id
                    }" class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows="2" placeholder="Yorum yaz..."></textarea>
                    <button class="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition" onclick="submitComment(${
                      post.post_id
                    })">Gönder</button>
                  </div>
                  <div id="comment-list-${
                    post.post_id
                  }" class="space-y-2 text-sm text-gray-800">Yorumlar yükleniyor...</div>
                </div>
            </div>
          `;
      container.innerHTML += html;
    });
  } catch (error) {
    console.error(error);
    container.innerHTML =
      '<p class="text-center text-red-500">Gönderiler yüklenemedi.</p>';
  }
}

function getProfileInfo() {
  authFetch("/auth/me")
    .then(async (response) => {
      if (response) {
        const user = await response.json();
        document.getElementById("sidebar-name").innerText =
          user.name || user.username;
        document.getElementById("sidebar-username").innerText =
          "@" + user.username;

        authFetch(`/users/profile/${user.user_id}`).then(async (res) => {
          if (res.ok) {
            const profile = await res.json();
            const stats = profile.stats;
            document.getElementById("sidebar-followers").innerText =
              stats.followers;
            document.getElementById("sidebar-following").innerText =
              stats.following;
          }
        });
      }
    })
    .catch(() => {
      const userName = localStorage.getItem("user_name") || "User";
      document.getElementById("sidebar-name").innerText = userName;
      document.getElementById("sidebar-username").innerText =
        "@" + userName.toLowerCase().replace(/\s/g, "");
    });
}

async function getFeed() {
  const container = document.getElementById("feed-container");
  try {
    const currentUser = JSON.parse(localStorage.getItem("user"));
    const currentUserId = currentUser?.id;
    const currentUserRole = localStorage.getItem("role");

    const response = await authFetch("/posts/feed");
    if (!response) return;
    const posts = await response.json();
    container.innerHTML = "";
    if (posts.length === 0) {
      container.innerHTML =
        '<p class="text-center text-gray-500">Henüz gönderi yok. İlk paylaşanı ol!</p>';
      return;
    }

    posts.forEach((post) => {
      const date = new Date(post.created_at).toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
      const initials = post.User.username.substring(0, 2).toUpperCase();
      const likeCount = post.likeCount || 0;
      const commentCount = post.commentCount || 0;
      const isLiked = !!post.isLiked;

      const chips = [];
      if (post.Book) {
        const bookCover = post.Book.cover_image
          ? `<img src="${post.Book.cover_image}" alt="${post.Book.title}" class="w-8 h-11 object-cover rounded" />`
          : '<div class="w-8 h-11 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs"><i class="fas fa-book"></i></div>';
        chips.push(`
              <div class="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs font-semibold text-gray-800 cursor-pointer hover:opacity-80 transition" onclick="window.location.href='book-details.html?id=${post.Book.book_id}'">
                ${bookCover}
                <span class="truncate max-w-[200px]">${post.Book.title}</span>
              </div>
            `);
      }
      if (post.TaggedUser) {
        chips.push(`
              <div class="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xs font-semibold text-gray-800 cursor-pointer hover:opacity-80 transition" onclick="window.location.href='user-profile.html?id=${post.TaggedUser.user_id}'">
                <i class="fas fa-user text-emerald-600"></i>
                <span>@${post.TaggedUser.username}</span>
              </div>
            `);
      }

      const html = `
            <div class="bg-white rounded-lg shadow p-4 relative">
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center font-bold text-indigo-600">${initials}</div>
                  <div class="leading-tight">
                    <div class="cursor-pointer" onclick="window.location.href='user-profile.html?id=${
                      post.User.user_id
                    }'">
                      <h4 class="font-bold text-sm hover:text-blue-600 transition">${
                        post.User.username
                      }</h4>
                      <p class="text-xs text-gray-500">${date}</p>
                    </div>
                  </div>
                </div>
                ${
                  post.User.user_id === 1
                    ? `<button onclick="deletePost(${post.post_id})" class="text-gray-400 hover:text-red-500"><i class="fas fa-trash"></i></button>`
                    : ""
                }
              </div>
              <p class="text-gray-800 mb-3 whitespace-pre-line">${escapeHtml(
                post.post_text
              )}</p>
              ${
                chips.length
                  ? `<div class="flex flex-wrap gap-2 mb-3">${chips.join(
                      ""
                    )}</div>`
                  : ""
              }
              <div class="flex items-center gap-6 text-gray-500 text-sm border-t pt-3 mt-3">
                <button class="flex items-center gap-2 transition" aria-label="Beğen" onclick="toggleLike(${
                  post.post_id
                }, this)">
                  <i class="${isLiked ? "fas" : "far"} fa-heart ${
        isLiked ? "text-red-500" : ""
      }"></i>
                  <span class="like-label ${isLiked ? "text-red-500" : ""}">${
        isLiked ? "Beğenildi" : "Beğen"
      }</span>
                  <span class="like-count">${likeCount}</span>
                </button>
                <button class="flex items-center gap-2 hover:text-blue-500 transition" aria-label="Yorum yap" onclick="toggleComments(${
                  post.post_id
                })">
                  <i class="far fa-comment"></i>
                  <span>Yorum</span>
                  <span class="comment-count">${commentCount}</span>
                </button>
              </div>
                <div id="comments-${
                  post.post_id
                }" class="hidden mt-3 border border-gray-200 rounded-lg p-3 bg-gray-50">
                  <div class="flex gap-2 mb-3">
                    <textarea id="comment-input-${
                      post.post_id
                    }" class="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" rows="2" placeholder="Yorum yaz..."></textarea>
                    <button class="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition" onclick="submitComment(${
                      post.post_id
                    })">Gönder</button>
                  </div>
                  <div id="comment-list-${
                    post.post_id
                  }" class="space-y-2 text-sm text-gray-800">Yorumlar yükleniyor...</div>
                </div>
            </div>
          `;
      container.innerHTML += html;
    });
  } catch (error) {
    console.error(error);
    container.innerHTML =
      '<p class="text-center text-red-500">Gönderiler yüklenemedi.</p>';
  }
}

async function getLatestBooks() {
  const container = document.getElementById("popular-books");
  try {
    const response = await authFetch("/books");
    if (!response || !response.ok) return;
    let books = await response.json();
    books = (Array.isArray(books) ? books : [])
      .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
      .slice(0, 5);

    container.innerHTML = "";
    if (books.length === 0) {
      container.innerHTML =
        '<p class="text-gray-500 text-sm">Henüz eklenen kitap yok.</p>';
      return;
    }

    books.forEach((book) => {
      const coverHtml = book.cover_image
        ? `<img src="${book.cover_image}" alt="${book.title}" class="w-10 h-14 object-cover rounded">`
        : '<div class="w-10 h-14 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs"><i class="fas fa-book"></i></div>';
      const authorName =
        Array.isArray(book.Authors) && book.Authors.length
          ? book.Authors.map((a) => a.full_name).join(", ")
          : book.authors || "Bilinmeyen";
      const html = `
            <a href="book-details.html?id=${book.book_id}" class="flex items-center gap-3 hover:bg-gray-50 p-2 rounded transition cursor-pointer">
              ${coverHtml}
              <div>
                <h4 class="font-bold text-sm">${book.title}</h4>
                <p class="text-xs text-gray-500">${authorName}</p>
              </div>
            </a>`;
      container.innerHTML += html;
    });
  } catch (error) {
    container.innerHTML =
      '<p class="text-red-500 text-sm">Son eklenen kitaplar yüklenemedi.</p>';
  }
}

async function toggleLike(postId, btnEl) {
  try {
    const res = await authFetch(`/posts/${postId}/like`, {
      method: "POST",
    });
    if (!res) return;
    const data = await res.json();
    const icon = btnEl.querySelector("i");
    const label = btnEl.querySelector(".like-label");
    const countEl = btnEl.querySelector(".like-count");
    if (data.liked) {
      icon.classList.remove("far");
      icon.classList.add("fas", "text-red-500");
      label.classList.add("text-red-500");
      label.textContent = "Beğenildi";
    } else {
      icon.classList.remove("fas", "text-red-500");
      icon.classList.add("far");
      label.classList.remove("text-red-500");
      label.textContent = "Beğen";
    }
    if (countEl) countEl.textContent = data.likeCount ?? 0;
  } catch (error) {
    alert("Beğeni işlemi başarısız oldu.");
  }
}

async function toggleComments(postId) {
  const box = document.getElementById(`comments-${postId}`);
  if (!box) return;
  const isHidden = box.classList.contains("hidden");
  if (isHidden) {
    box.classList.remove("hidden");
    await loadComments(postId);
  } else {
    box.classList.add("hidden");
  }
}

async function loadComments(postId) {
  const list = document.getElementById(`comment-list-${postId}`);
  if (!list) return;
  list.textContent = "Yorumlar yükleniyor...";
  try {
    const res = await authFetch(`/posts/${postId}/comments`);
    if (!res || !res.ok) {
      list.textContent = "Yorumlar yüklenemedi.";
      return;
    }
    const comments = await res.json();
    if (!Array.isArray(comments) || comments.length === 0) {
      list.textContent = "Henüz yorum yok.";
      return;
    }
    list.innerHTML = comments
      .map((c) => {
        const username = c.User?.username ? `@${c.User.username}` : "Anonim";
        const dateStr = c.created_at
          ? new Date(c.created_at).toLocaleDateString("tr-TR")
          : "";
        const text = (c.comment_text || "")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;");
        return `<div class="bg-white border border-gray-200 rounded-md p-2">
                <div class="text-xs text-gray-500 flex justify-between"><span>${username}</span><span>${dateStr}</span></div>
                <p class="text-gray-800 mt-1">${text}</p>
              </div>`;
      })
      .join("");
  } catch (error) {
    list.textContent = "Yorumlar yüklenemedi.";
  }
}

async function submitComment(postId) {
  const input = document.getElementById(`comment-input-${postId}`);
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;
  try {
    const res = await authFetch(`/posts/${postId}/comments`, {
      method: "POST",
      body: JSON.stringify({ comment_text: text }),
    });
    if (res && res.ok) {
      const data = await res.json();
      input.value = "";
      await loadComments(postId);

      const postContainer = document
        .querySelector(`#comments-${postId}`)
        ?.closest(".bg-white");
      if (postContainer) {
        const commentCountEl = postContainer.querySelector(".comment-count");
        if (commentCountEl && typeof data.commentCount !== "undefined") {
          commentCountEl.textContent = data.commentCount;
        }
      }
    } else {
      alert("Yorum eklenemedi");
    }
  } catch (error) {
    alert("Yorum eklenemedi");
  }
}

async function deletePost(postId) {
  if (!confirm("Bu gönderiyi silmek istediğinizden emin misiniz?")) {
    return;
  }

  try {
    const response = await authFetch(`/posts/${postId}`, {
      method: "DELETE",
    });

    if (response && response.ok) {
      alert("Gönderi silindi!");
      getFeed();
    } else {
      const data = await response.json();
      alert(data.error || "Gönderi silinemedi.");
    }
  } catch (error) {
    console.error("Delete post error:", error);
    alert("Gönderi silinirken hata oluştu.");
  }
}
