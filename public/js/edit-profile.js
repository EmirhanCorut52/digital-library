document.addEventListener("DOMContentLoaded", async () => {
  try {
    const response = await authFetch("/auth/me");
    if (response.ok) {
      const user = await response.json();

      document.getElementById("input-ad").value =
        user.name && user.name !== "undefined" ? user.name : "";
      document.getElementById("input-kadi").value = user.username || "";
      document.getElementById("input-email").value = user.email || "";
      document.getElementById("input-bio").value =
        user.bio && user.bio !== "undefined" ? user.bio : "";
    }
  } catch (error) {
    console.error("Bilgiler çekilemedi:", error);
  }
});

async function save(e) {
  e.preventDefault();

  const btn = e.target.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Kaydediliyor...';
  btn.disabled = true;

  const adVal = document.getElementById("input-ad").value;
  const nickVal = document.getElementById("input-kadi").value;
  const emailVal = document.getElementById("input-email").value;
  const bioVal = document.getElementById("input-bio").value;

  try {
    const response = await authFetch("/auth/update-profile", {
      method: "PUT",
      body: JSON.stringify({
        name: adVal,
        username: nickVal,
        email: emailVal,
        bio: bioVal,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert("Profil bilgileriniz güncellendi!");
      if (data.user) {
        localStorage.setItem("user_name", data.user.name || data.user.username);
      }
      window.location.href = "profile.html";
    } else {
      alert("Hata: " + (data.error || "Güncellenemedi"));
    }
  } catch (error) {
    console.error(error);
    alert("Sunucu hatası oluştu.");
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}

function logout() {
  if (confirm("Çıkış yapmak istediğinize emin misiniz?")) {
    localStorage.clear();
    window.location.href = "login.html";
  }
}
