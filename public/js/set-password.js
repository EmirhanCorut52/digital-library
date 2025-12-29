function updatePassword(e) {
  e.preventDefault();

  const p1 = document.getElementById("pass1").value;
  const p2 = document.getElementById("pass2").value;
  const btn = document.querySelector('button[type="submit"]');

  if (p1.length < 8) {
    alert("Şifreniz en az 8 karakter olmalıdır!");
    return;
  }

  if (!/[a-zA-Z]/.test(p1) || !/\d/.test(p1)) {
    alert("Şifre harf ve rakam içermelidir!");
    return;
  }

  if (p1 !== p2) {
    alert("Girdiğiniz şifreler birbiriyle uyuşmuyor!");
    return;
  }

  const token = localStorage.getItem("reset_token");
  if (!token) {
    alert(
      "Geçersiz sıfırlama oturumu. Lütfen tekrar şifremi unuttum adımından geçin."
    );
    window.location.href = "forgot-password.html";
    return;
  }

  btn.innerHTML =
    '<i class="fas fa-spinner fa-spin mr-2"></i> Güncelleniyor...';
  btn.disabled = true;
  btn.classList.add("opacity-75", "cursor-not-allowed");

  fetch("/api/auth/reset-password", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token: token,
      new_password: p1,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      if (data.message) {
        alert("Şifreniz başarıyla güncellendi! Giriş yapabilirsiniz.");
        localStorage.removeItem("reset_token");
        localStorage.removeItem("reset_email");
        window.location.href = "login.html";
      } else {
        alert("Hata: " + (data.error || "Şifre güncellenemedi."));
      }
    })
    .catch((error) => {
      console.error(error);
      alert("Sunucu hatası.");
    })
    .finally(() => {
      btn.innerHTML = "Şifreyi Güncelle";
      btn.disabled = false;
      btn.classList.remove("opacity-75", "cursor-not-allowed");
    });
}
