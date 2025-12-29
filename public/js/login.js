function toggleForm(formType) {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const tabLogin = document.getElementById("tab-login");
  const tabRegister = document.getElementById("tab-register");

  if (formType === "login") {
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
    tabLogin.className =
      "pb-2 border-b-2 border-blue-600 font-semibold text-blue-600 focus:outline-none";
    tabRegister.className =
      "pb-2 text-gray-600 hover:text-blue-600 font-semibold focus:outline-none";
  } else {
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
    tabRegister.className =
      "pb-2 border-b-2 border-blue-600 font-semibold text-blue-600 focus:outline-none";
    tabLogin.className =
      "pb-2 text-gray-600 hover:text-blue-600 font-semibold focus:outline-none";
  }
}
