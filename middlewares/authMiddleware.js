const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res
        .status(401)
        .json({ error: "Yetkisiz erişim! Lütfen giriş yapın." });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res
        .status(401)
        .json({ error: "Yetkisiz erişim! Lütfen giriş yapın." });
    }

    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    req.userData = {
      userId: decodedToken.id,
      role: decodedToken.role,
    };

    next();
  } catch (error) {
    res.status(401).json({ error: "Yetkisiz erişim! Lütfen giriş yapın." });
  }
};
