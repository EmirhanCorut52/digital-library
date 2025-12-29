exports.validatePassword = (password) => {
  if (!password) {
    return { isValid: false, error: "Şifre gereklidir." };
  }

  if (password.length < 8) {
    return { isValid: false, error: "Şifre en az 8 karakter olmalıdır." };
  }

  if (!/[a-zA-Z]/.test(password)) {
    return { isValid: false, error: "Şifre en az bir harf içermelidir." };
  }

  if (!/\d/.test(password)) {
    return { isValid: false, error: "Şifre en az bir rakam içermelidir." };
  }

  return { isValid: true, error: null };
};

exports.validateEmail = (email) => {
  if (!email) {
    return { isValid: false, error: "E-posta gereklidir." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { isValid: false, error: "Geçerli bir e-posta adresi girin." };
  }

  return { isValid: true, error: null };
};

exports.validateUsername = (username) => {
  if (!username) {
    return { isValid: false, error: "Kullanıcı adı gereklidir." };
  }

  if (username.length < 3) {
    return {
      isValid: false,
      error: "Kullanıcı adı en az 3 karakter olmalıdır.",
    };
  }

  if (username.length > 50) {
    return {
      isValid: false,
      error: "Kullanıcı adı en fazla 50 karakter olabilir.",
    };
  }

  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      isValid: false,
      error: "Kullanıcı adı sadece harf, rakam ve alt çizgi içerebilir.",
    };
  }

  return { isValid: true, error: null };
};
