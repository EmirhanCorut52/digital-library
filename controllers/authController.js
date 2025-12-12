const { Op } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

exports.kayitOl = async (req, res) => {
    try {
        const { kullanici_adi, e_posta, parola } = req.body;

        if (!kullanici_adi || !e_posta || !parola) {
            return res.status(400).json({ hata: 'Lütfen tüm alanları doldurun.' });
        }

        const mevcutKullanici = await User.findOne({ 
            where: {
                [Op.or]: [
                    { e_posta: e_posta },
                    { kullanici_adi: kullanici_adi }
                ]
            }
        });

        if (mevcutKullanici) {
            return res.status(400).json({ hata: 'Bu kullanıcı adı veya e-posta zaten kullanımda.' });
        }

        const parola_hash = await bcrypt.hash(parola, 10);

        const yeniKullanici = await User.create({
            kullanici_adi,
            e_posta,
            parola_hash,
            rol: 'kullanici'
        });

        res.status(201).json({ 
            mesaj: 'Kayıt işlemi başarılı!', 
            kullanici_id: yeniKullanici.kullanici_id 
        });

    } catch (error) {
        console.error('Kayıt Hatası:', error);
        res.status(500).json({ hata: 'Sunucu hatası oluştu.' });
    }
};

exports.girisYap = async (req, res) => {
    try {
        const { e_posta, parola } = req.body;

        if (!e_posta || !parola) {
            return res.status(400).json({ hata: 'Lütfen e-posta ve şifrenizi girin.' });
        }

        const kullanici = await User.findOne({ where: { e_posta: e_posta } });

        if (!kullanici) {
            return res.status(401).json({ hata: 'Geçersiz e-posta veya şifre.' });
        }

        const sifreDogruMu = await bcrypt.compare(parola, kullanici.parola_hash);

        if (!sifreDogruMu) {
            return res.status(401).json({ hata: 'Geçersiz e-posta veya şifre.' });
        }

        const token = jwt.sign(
            { id: kullanici.kullanici_id, rol: kullanici.rol },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_SURESI }
        );

        res.status(200).json({
            mesaj: 'Giriş başarılı!',
            token: token,
            kullanici: {
                id: kullanici.kullanici_id,
                ad: kullanici.kullanici_adi,
                email: kullanici.e_posta
            }
        });

    } catch (error) {
        console.error('Giriş Hatası:', error);
        res.status(500).json({ hata: 'Sunucu hatası oluştu.' });
    }
};

// ... (üstteki kodlar aynı)

// 1. Şifre Sıfırlama İsteği (E-posta Gönderme Simülasyonu)
exports.sifremiUnuttum = async (req, res) => {
    try {
        const { e_posta } = req.body;

        // Kullanıcıyı bul
        const kullanici = await User.findOne({ where: { e_posta } });

        if (!kullanici) {
            return res.status(404).json({ hata: "Bu e-posta adresiyle kayıtlı kullanıcı bulunamadı." });
        }

        // 15 dakikalık geçici bir token oluştur (Sadece şifre sıfırlama için)
        const resetToken = jwt.sign(
            { id: kullanici.kullanici_id, type: 'reset' }, 
            process.env.JWT_SECRET, 
            { expiresIn: '15m' }
        );

        // E-posta gönderme simülasyonu
        // Gerçek hayatta burası kullanıcının mailine giderdi.
        const resetLink = `http://localhost:3000/api/auth/sifre-sifirla?token=${resetToken}`;

        console.log("-------------------------------------------------------");
        console.log("📧 [SİMÜLASYON] Şifre Sıfırlama E-postası Gönderildi!");
        console.log(`🔗 Link: ${resetLink}`);
        console.log("-------------------------------------------------------");

        res.status(200).json({ mesaj: "Sıfırlama bağlantısı e-posta adresinize gönderildi (Lütfen terminali kontrol edin)." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ hata: "İşlem başarısız." });
    }
};

exports.sifreSifirla = async (req, res) => {
    try {
        const { token, yeni_parola } = req.body;

        if (!token || !yeni_parola) {
            return res.status(400).json({ hata: "Geçersiz istek." });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.type !== 'reset') {
            return res.status(400).json({ hata: "Geçersiz token tipi." });
        }

        const yeniParolaHash = await bcrypt.hash(yeni_parola, 10);

        await User.update(
            { parola_hash: yeniParolaHash },
            { where: { kullanici_id: decoded.id } }
        );

        res.status(200).json({ mesaj: "Şifreniz başarıyla güncellendi! Yeni şifrenizle giriş yapabilirsiniz." });

    } catch (error) {
        res.status(400).json({ hata: "Sıfırlama bağlantısının süresi dolmuş veya geçersiz." });
    }
};