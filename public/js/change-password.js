async function changePassword(e) {
  e.preventDefault();

  const currentPass = document.getElementById("current-pass").value;
  const newPass = document.getElementById("new-pass").value;
  const confirmPass = document.getElementById("confirm-pass").value;
  const btn = e.target.querySelector('button[type="submit"]');

  if (newPass !== confirmPass) {
    alert("Yeni şifreler birbiriyle uyuşmuyor!");
    return;
  }

  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML =
    '<i class="fas fa-spinner fa-spin mr-2"></i> Güncelleniyor...';

  try {
    const response = await authFetch("/auth/change-password", {
      method: "PUT",
      body: JSON.stringify({
        currentPassword: currentPass,
        newPassword: newPass,
      }),
    });

    const data = await response.json();

    if (response.ok) {
      alert(
        "Şifreniz başarıyla değiştirildi! Lütfen yeni şifrenizle tekrar giriş yapın."
      );
      localStorage.clear();
      window.location.href = "login.html";
    } else {
      alert(
        "Hata: " +
          (data.error ||
            "Şifre değiştirilemedi. Mevcut şifrenizi kontrol edin.")
      );
    }
  } catch (error) {
    console.error(error);
    alert("Sunucu hatası.");
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
  }
}
