const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const {
  validatePassword,
  validateEmail,
  validateUsername,
} = require("../utils/validators");

exports.register = async (req, res) => {
  try {
    const { name, username, email, password } = req.body;

    if (!name || !username || !email || !password) {
      return res.status(400).json({ error: "Lütfen tüm alanları doldurun." });
    }

    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ error: passwordValidation.error });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return res.status(400).json({ error: emailValidation.error });
    }

    const usernameValidation = validateUsername(username);
    if (!usernameValidation.isValid) {
      return res.status(400).json({ error: usernameValidation.error });
    }

    const existingUser = await User.findOne({
      where: {
        [Op.or]: [{ email: email }, { username: username }],
      },
    });

    if (existingUser) {
      return res
        .status(400)
        .json({ error: "Bu kullanıcı adı veya e-posta zaten kullanılıyor." });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      username,
      email,
      password_hash,
      role: "user",
    });

    res.status(201).json({
      message: "Kayıt başarılı! Giriş yapabilirsiniz.",
      user_id: newUser.user_id,
    });
  } catch (error) {
    console.error("register error", error);
    res.status(500).json({ error: "Kayıt oluşturulurulamadı." });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ error: "Lütfen e-posta ve şifrenizi girin." });
    }

    const user = await User.findOne({ where: { email: email } });

    if (!user) {
      return res.status(401).json({ error: "Geçersiz e-posta veya şifre." });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password_hash
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({ error: "Geçersiz e-posta veya şifre." });
    }

    const token = jwt.sign(
      { id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_TIMEOUT }
    );

    res.status(200).json({
      token: token,
      user: {
        id: user.user_id,
        name: user.name || user.username,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("login error", error);
    res.status(500).json({ error: "Giriş yapılamadı." });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ where: { email } });

    if (!user) {
      return res
        .status(404)
        .json({ error: "Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı." });
    }

    const resetToken = jwt.sign(
      { id: user.user_id, type: "reset" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    res.status(200).json({
      message:
        "Şifreniz başarıyla sıfırlandı! Yeni şifrenizle giriş yapabilirsiniz.",
      resetToken: resetToken,
    });
  } catch (error) {
    res.status(500).json({ error: "Şifre sıfırlama işlemi başarısız oldu." });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({ error: "Geçersiz istek." });
    }

    const passwordValidation = validatePassword(new_password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ error: passwordValidation.error });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.type !== "reset") {
      return res.status(400).json({ error: "Geçersiz token türü." });
    }

    const newPasswordHash = await bcrypt.hash(new_password, 10);

    await User.update(
      { password_hash: newPasswordHash },
      { where: { user_id: decoded.id } }
    );

    res.status(200).json({
      message:
        "Şifreniz başarıyla güncellendi! Yeni şifrenizle giriş yapabilirsiniz.",
    });
  } catch (error) {
    res.status(400).json({ error: "İşlem başarısız oldu." });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.userData?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Oturum doğrulanamadı." });
    }
    const { name, username, bio, email } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    if (name !== undefined) {
      user.name = name;
    }
    if (username !== undefined) {
      user.username = username;
    }
    if (email !== undefined) {
      user.email = email;
    }
    if (bio !== undefined) {
      user.bio = bio;
    }

    await user.save();

    res.json({
      message: "Profil güncellendi.",
      user: {
        id: user.user_id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(400)
        .json({ error: "Kullanıcı adı veya e-posta zaten kullanılıyor." });
    }

    if (error.name === "SequelizeValidationError") {
      return res
        .status(400)
        .json({ error: error.errors?.[0]?.message || "Geçersiz veri." });
    }

    console.error("Update profile error:", error);
    res.status(500).json({ error: "Güncelleme başarısız oldu." });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.userData?.userId;
    const { currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ error: "Yetkisiz erişim!" });
    }

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Mevcut şifre ve yeni şifre gereklidir." });
    }

    const passwordValidation = validatePassword(newPassword);
    if (!passwordValidation.isValid) {
      return res.status(400).json({ error: passwordValidation.error });
    }

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    const isPasswordCorrect = await bcrypt.compare(
      currentPassword,
      user.password_hash
    );
    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Mevcut şifre yanlış." });
    }

    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    user.password_hash = newPasswordHash;
    await user.save();

    res.json({ message: "Şifre başarıyla değiştirildi." });
  } catch (error) {
    console.error("Change password error:", error);
    res.status(500).json({ error: "Şifre değiştirilemedi." });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.userData?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Yetkisiz erişim!" });
    }

    const user = await User.findByPk(userId, {
      attributes: [
        "user_id",
        "username",
        "email",
        "name",
        "role",
        "created_at",
        "bio",
      ],
    });
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }
    res.json(user);
  } catch (error) {
    console.error("Get profile error:", error);
    res.status(500).json({ error: "Profil bilgileri alınamadı." });
  }
};
