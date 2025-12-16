const { Op } = require("sequelize");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: "Lütfen tüm alanları doldurun." });
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
      username,
      email,
      password_hash,
      role: "user",
    });

    res.status(201).json({
      message: "Registration successful!",
      user_id: newUser.user_id,
    });
  } catch (error) {
    console.error("Registration Error:", error);
    res.status(500).json({ error: "Sunucu hatası oluştu." });
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
      message: "Login successful!",
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
    console.error("Login Error:", error);
    res.status(500).json({ error: "Sunucu hatası oluştu." });
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

    const resetLink = `http://localhost:3000/api/auth/reset-password?token=${resetToken}`;

    console.log("-------------------------------------------------------");
    console.log("[SIMULATION] Password Reset Email Sent!");
    console.log(`Link: ${resetLink}`);
    console.log("-------------------------------------------------------");

    res.status(200).json({
      message:
        "Reset link sent to your email address (Please check the terminal).",
      resetToken: resetToken,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "İşlem başarısız oldu." });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, new_password } = req.body;

    if (!token || !new_password) {
      return res.status(400).json({ error: "Geçersiz istek." });
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
        "Your password has been successfully updated! You can log in with your new password.",
    });
  } catch (error) {
    res
      .status(400)
      .json({ error: "Sıfırlama bağlantısının süresi dolmuş veya geçersiz." });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { name, username, bio, email } = req.body;

    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    user.name = name || user.name;
    user.username = username || user.username;
    user.email = email || user.email;
    user.bio = bio || user.bio;

    await user.save();

    res.json({
      message: "Profile updated.",
      user: {
        id: user.user_id,
        name: user.name,
        username: user.username,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ error: "Güncelleme başarısız oldu." });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res
        .status(400)
        .json({ error: "Mevcut şifre ve yeni şifre gereklidir." });
    }

    if (newPassword.length < 6) {
      return res
        .status(400)
        .json({ error: "Yeni şifre en az 6 karakter olmalıdır." });
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

    res.json({ message: "Password changed successfully." });
  } catch (error) {
    console.error("Password change error:", error);
    res.status(500).json({ error: "Şifre değiştirilemedi." });
  }
};

exports.getProfile = async (req, res) => {
  try {
    const userId = req.userData.userId;
    const user = await User.findByPk(userId, {
      attributes: [
        "user_id",
        "username",
        "email",
        "name",
        "role",
        "created_at",
      ],
    });
    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }
    res.json(user);
  } catch (error) {
    console.error("Profile retrieval error:", error);
    res.status(500).json({ error: "Profil bilgileri alınamadı." });
  }
};
