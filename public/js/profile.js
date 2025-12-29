function switchTab(tabName) {
  document.getElementById("content-posts").classList.add("hidden");
  document.getElementById("content-comments").classList.add("hidden");
  document.getElementById("content-following").classList.add("hidden");
  document.getElementById("content-followers").classList.add("hidden");

  const tabs = ["posts", "comments", "following", "followers"];
  tabs.forEach((t) => {
    const btn = document.getElementById("tab-" + t);
    btn.classList.remove("border-blue-600", "text-blue-600");
    btn.classList.add("border-transparent", "text-gray-500");
  });
  document.getElementById("content-" + tabName).classList.remove("hidden");
  const activeBtn = document.getElementById("tab-" + tabName);
  activeBtn.classList.remove("border-transparent", "text-gray-500");
  activeBtn.classList.add("border-blue-600", "text-blue-600");
  activeBtn.classList.add("hover:text-blue-600");

  if (tabName === "comments" && !window.commentsLoaded) {
    const userResponse = authFetch("/auth/me").then(async (res) => {
      if (res) {
        const user = await res.json();
        getUserComments(user.user_id);
        window.commentsLoaded = true;
      }
    });
  }
  if (tabName === "following" && !window.followingLoaded) {
    const userResponse = authFetch("/auth/me").then(async (res) => {
      if (res) {
        const user = await res.json();
        getFollowing(user.user_id);
        window.followingLoaded = true;
      }
    });
  }
  if (tabName === "followers" && !window.followersLoaded) {
    const userResponse = authFetch("/auth/me").then(async (res) => {
      if (res) {
        const user = await res.json();
        getFollowers(user.user_id);
        window.followersLoaded = true;
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  try {
    const userResponse = await authFetch("/auth/me");
    if (!userResponse) {
      window.location.href = "login.html";
      return;
    }
    const user = await userResponse.json();

    document.getElementById("profile-name").innerText =
      user.name && user.name !== "undefined" ? user.name : user.username;
    document.getElementById("profile-username").innerText = "@" + user.username;
    const createdDate = user.created_at
      ? new Date(user.created_at).toLocaleDateString("tr-TR")
      : "-";
    const dateEl = document.getElementById("profile-date");
    if (dateEl) {
      dateEl.innerText = "Üyelik Tarihi: " + createdDate;
    }
    document.getElementById("profile-bio").innerText =
      user.bio && user.bio !== "undefined"
        ? user.bio
        : "Henüz açıklama eklenmedi.";

    const profileResponse = await authFetch(`/users/profile/${user.user_id}`);
    if (profileResponse.ok) {
      const profileData = await profileResponse.json();
      const stats = profileData.stats;

      document.getElementById("stat-posts").innerText = stats.posts;
      document.getElementById("stat-comments").innerText = stats.comments;
      document.getElementById("stat-following").innerText = stats.following;
      document.getElementById("stat-followers").innerText = stats.followers;
    }

    await getUserPosts(user.user_id);
  } catch (error) {
    console.error("Profile loading error:", error);
    alert("Profil bilgileri yüklenemedi.");
    window.location.href = "login.html";
  }
});

async function getUserPosts(userId) {
  const container = document.getElementById("content-posts");
  const statPosts = document.getElementById("stat-posts");

  try {
    const response = await authFetch("/posts/feed");
    if (!response) return;

    const allPosts = await response.json();

    const myPosts = allPosts.filter((post) => post.user_id == userId);

    statPosts.innerText = myPosts.length;

    container.innerHTML = "";

    if (myPosts.length === 0) {
      container.innerHTML =
        '<div class="text-center py-8"><i class="fas fa-pen-fancy text-4xl text-gray-200 mb-3"></i><p class="text-gray-500">Henüz hiçbir gönderi paylaşılmadı.</p></div>';
      return;
    }

    myPosts.forEach((post) => {
      const date = new Date(post.created_at).toLocaleDateString("tr-TR");

      const username = post.User ? post.User.username : "Kullanıcı";
      const initial = username.charAt(0).toUpperCase();

      const chips = [];
      if (post.Book) {
        const bookCover = post.Book.cover_image
          ? `<img src="${post.Book.cover_image}" alt="${post.Book.title}" class="w-8 h-11 object-cover rounded" />`
          : '<div class="w-8 h-11 bg-gray-200 rounded flex items-center justify-center text-gray-400 text-xs"><i class="fas fa-book"></i></div>';
        chips.push(`
                <div class="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2 text-xs font-semibold text-gray-800">
                  ${bookCover}
                  <span class="truncate max-w-[200px]">${post.Book.title}</span>
                </div>
              `);
      }
      if (post.TaggedUser) {
        chips.push(`
                <div class="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2 text-xs font-semibold text-gray-800">
                  <i class="fas fa-user text-emerald-600"></i>
                  <span>@${post.TaggedUser.username}</span>
                </div>
              `);
      }

      const html = `
                <div class="bg-white rounded-lg shadow p-5 mb-4 border border-gray-100 relative group" id="post-${
                  post.post_id
                }">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex items-center gap-3">
                            <div class="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                      ${initial}
                            </div>
                            <div>
                      <h4 class="font-bold text-sm">${username}</h4>
                      <p class="text-xs text-gray-500">${date}</p>
                            </div>
                        </div>
                  <button onclick="deletePost(${
                    post.post_id
                  })" class="text-gray-400 hover:text-red-500 transition p-2" title="Sil">
                            <i class="fas fa-trash text-sm"></i>
                        </button>
                    </div>
                    <p class="text-gray-800 mb-3 whitespace-pre-line">${
                      post.post_text
                    }</p>
                    ${
                      chips.length
                        ? `<div class="flex flex-wrap gap-2 mb-3">${chips.join(
                            ""
                          )}</div>`
                        : ""
                    }
                    <div class="flex items-center gap-4 text-gray-500 text-sm">
                        <span><i class="far fa-heart mr-1"></i> ${
                          post.likeCount || 0
                        } Beğeni</span>
                    </div>
                </div>
                `;
      container.innerHTML += html;
    });
  } catch (error) {
    console.error(error);
    container.innerHTML =
      '<p class="text-red-500 text-center">Yüklenemedi.</p>';
  }
}

async function getUserComments(userId) {
  const container = document.getElementById("content-comments");
  const statComments = document.getElementById("stat-comments");

  try {
    const response = await authFetch(`/comments/user/${userId}`);
    if (!response) return;

    const comments = await response.json();

    if (!Array.isArray(comments)) {
      container.innerHTML =
        '<p class="text-red-500 text-center">Yorumlar yüklenemedi.</p>';
      return;
    }

    container.innerHTML = "";

    if (comments.length === 0) {
      statComments.innerText = 0;
      container.innerHTML =
        '<div class="text-center py-8"><i class="fas fa-comments text-4xl text-gray-200 mb-3"></i><p class="text-gray-500">Henüz yorum yapmadınız.</p></div>';
      return;
    }

    statComments.innerText = comments.length;

    comments.forEach((comment) => {
      const date = new Date(comment.created_at).toLocaleDateString("tr-TR");
      const bookTitle = comment.book_title || "Bilinmeyen Kitap";
      const author = comment.book_author || "";

      let starsHtml = "";
      for (let i = 0; i < 5; i++) {
        if (i < comment.rating)
          starsHtml += '<i class="fas fa-star text-yellow-400"></i>';
        else starsHtml += '<i class="far fa-star text-gray-300"></i>';
      }

      const html = `
                <div class="bg-white rounded-lg shadow p-5 mb-4 border border-gray-100" id="comment-${comment.comment_id}">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex items-start flex-1">
                            <div class="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-600 flex-shrink-0">
                                <i class="fas fa-book"></i>
                            </div>
                            <div class="flex-1 ml-3">
                                <h4 class="font-bold text-sm"><a href="book-details.html?id=${comment.book_id}" class="hover:underline text-blue-600">${bookTitle}</a></h4>
                                <p class="text-xs text-gray-500">${author} • ${date}</p>
                            </div>
                        </div>
                        <button 
                            onclick="deleteUserComment(${comment.comment_id})"
                            class="text-gray-400 hover:text-red-500 transition p-2"
                            title="Yorumu sil"
                        >
                            <i class="fas fa-trash text-sm"></i>
                        </button>
                    </div>
                    <div class="flex justify-between items-start">
                        <div class="flex text-sm">
                            ${starsHtml}
                        </div>
                    </div>
                    <p class="text-gray-800 whitespace-pre-line mt-3">${comment.comment_text}</p>
                </div>
                `;
      container.innerHTML += html;
    });
  } catch (error) {
    console.error(error);
    container.innerHTML =
      '<p class="text-red-500 text-center">Yorumlar yüklenemedi.</p>';
  }
}

async function getFollowing(userId) {
  const container = document.getElementById("content-following");

  try {
    const response = await authFetch(`/users/following/${userId}`);
    if (!response) return;

    const following = await response.json();

    container.innerHTML = "";

    if (following.length === 0) {
      container.innerHTML =
        '<div class="text-center py-8 col-span-2"><i class="fas fa-users text-4xl text-gray-200 mb-3"></i><p class="text-gray-500">Henüz kimseyi takip etmiyorsunuz.</p></div>';
      return;
    }

    following.forEach((user) => {
      const name = user.name || user.username;
      const initial = name.charAt(0).toUpperCase();

      const html = `
                <div class="bg-white rounded-lg shadow p-4 flex items-center gap-4">
                    <div class="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center font-bold text-blue-600">
                        ${initial}
                    </div>
                    <div class="flex-1">
                        <h4 class="font-bold text-sm"><a href="user-profile.html?id=${user.user_id}" class="hover:underline text-blue-600">${name}</a></h4>
                        <p class="text-xs text-gray-500">@${user.username}</p>
                    </div>
                </div>
                `;
      container.innerHTML += html;
    });
  } catch (error) {
    console.error(error);
    container.innerHTML =
      '<p class="text-red-500 text-center col-span-2">Takip listesi yüklenemedi.</p>';
  }
}

async function getFollowers(userId) {
  const container = document.getElementById("content-followers");

  try {
    const response = await authFetch(`/users/followers/${userId}`);
    if (!response) return;

    const followers = await response.json();

    container.innerHTML = "";

    if (followers.length === 0) {
      container.innerHTML =
        '<div class="text-center py-8 col-span-2"><i class="fas fa-users text-4xl text-gray-200 mb-3"></i><p class="text-gray-500">Henüz takipçiniz yok.</p></div>';
      return;
    }

    followers.forEach((user) => {
      const name = user.name || user.username;
      const initial = name.charAt(0).toUpperCase();

      const html = `
                <div class="bg-white rounded-lg shadow p-4 flex items-center gap-4">
                    <div class="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center font-bold text-green-600">
                        ${initial}
                    </div>
                    <div class="flex-1">
                        <h4 class="font-bold text-sm"><a href="user-profile.html?id=${user.user_id}" class="hover:underline text-blue-600">${name}</a></h4>
                        <p class="text-xs text-gray-500">@${user.username}</p>
                    </div>
                </div>
                `;
      container.innerHTML += html;
    });
  } catch (error) {
    console.error(error);
    container.innerHTML =
      '<p class="text-red-500 text-center col-span-2">Takipçi listesi yüklenemedi.</p>';
  }
}

async function deleteUserComment(commentId) {
  if (!confirm("Bu yorumu silmek istediğinizden emin misiniz?")) {
    return;
  }

  try {
    const response = await authFetch(`/comments/${commentId}`, {
      method: "DELETE",
    });

    if (response.ok) {
      const commentElement = document.getElementById(`comment-${commentId}`);
      if (commentElement) {
        commentElement.remove();
      }
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && (user.id || user.user_id)) {
        setTimeout(() => {
          getUserComments(user.id || user.user_id);
        }, 500);
      }
    } else {
      alert("Yorum silinemedi.");
    }
  } catch (error) {
    alert("Yorum silinirken hata oluştu.");
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

    if (response.ok) {
      const postElement = document.getElementById(`post-${postId}`);
      if (postElement) {
        postElement.remove();
      }
      const user = JSON.parse(localStorage.getItem("user"));
      if (user && (user.id || user.user_id)) {
        setTimeout(() => {
          getUserPosts(user.id || user.user_id);
        }, 500);
      }
    } else {
      alert("Gönderi silinemedi.");
    }
  } catch (error) {
    alert("Gönderi silinirken hata oluştu.");
  }
}

function logout() {
  if (confirm("Çıkış yapmak istediğinizden emin misiniz?")) {
    localStorage.clear();
    window.location.href = "login.html";
  }
}
