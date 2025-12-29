async function checkEmail(e) {
  e.preventDefault();
  const email = document.getElementById("email-input").value;
  const btn = document.querySelector('button[type="submit"]');

  const originalText = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Kontrol Ediliyor...';

  try {
    const response = await fetch("/api/auth/forgot-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: email }),
    });

    const data = await response.json();

    if (response.ok) {
      localStorage.setItem("reset_email", email);
      localStorage.setItem("reset_token", data.resetToken);
      window.location.href = "set-password.html";
    } else {
      alert("Hata: " + (data.error || "Kullanıcı bulunamadı."));
    }
  } catch (error) {
    console.error(error);
    alert("Sunucu hatası.");
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalText;
  }
}
