module.exports = (req, res, next) => {
  const role = req.userData?.role;

  if (role !== "admin") {
    return res
      .status(403)
      .json({
        error: "Erişim reddedildi: Bu işlem için yönetici yetkisi gerekli.",
      });
  }

  next();
};
