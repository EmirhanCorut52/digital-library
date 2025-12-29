function openGoogleBooksModal() {
  const modal = document.getElementById("google-books-modal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
  document.body.style.overflow = "hidden";
  setTimeout(() => {
    const input = document.getElementById("google-books-query");
    if (input) input.focus();
  }, 0);
}
function closeGoogleBooksModal() {
  const modal = document.getElementById("google-books-modal");
  modal.classList.remove("flex");
  modal.classList.add("hidden");
  const q = document.getElementById("google-books-query");
  const r = document.getElementById("google-books-results");
  const l = document.getElementById("google-books-list");
  if (q) q.value = "";
  if (r) r.classList.add("hidden");
  if (l) l.innerHTML = "";
  document.body.style.overflow = "";
}
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    const modal = document.getElementById("google-books-modal");
    if (modal && !modal.classList.contains("hidden")) {
      closeGoogleBooksModal();
    }
  }
});
