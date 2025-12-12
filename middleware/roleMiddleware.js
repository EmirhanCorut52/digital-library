module.exports = (req, res, next) => {
    if (req.userData.rol !== 'yonetici') {
        return res.status(403).json({ 
            hata: "Erişim Reddedildi: Bu işlemi yapmaya yetkiniz yok (Sadece Yöneticiler)." 
        });
    }

    next();
};