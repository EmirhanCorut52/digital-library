const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.headers.authorization.split(" ")[1];

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

        req.userData = { 
            userId: decodedToken.id, 
            rol: decodedToken.rol 
        };

        next(); 

    } catch (error) {
        res.status(401).json({ hata: "Yetkisiz erişim! Lütfen giriş yapın." });
    }
};