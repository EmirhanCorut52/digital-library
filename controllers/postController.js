const Post = require('../models/Post');
const User = require('../models/User');

exports.gonderiOlustur = async (req, res) => {
    try {
        const { metin } = req.body;

        if (!metin) {
            return res.status(400).json({ hata: 'Gönderi metni boş olamaz.' });
        }

        const yeniGonderi = await Post.create({
            gonderi_metni: metin,
            kullanici_id: req.userData.userId
        });

        res.status(201).json({
            mesaj: 'Gönderi paylaşıldı!',
            gonderi: yeniGonderi
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ hata: 'Gönderi oluşturulamadı.' });
    }
};

exports.akisGetir = async (req, res) => {
    try {
        const gonderiler = await Post.findAll({
            include: [{
                model: User,
                attributes: ['kullanici_adi']
            }],
            order: [['olusturma_tarihi', 'DESC']]
        });

        res.status(200).json(gonderiler);

    } catch (error) {
        console.error(error);
        res.status(500).json({ hata: 'Akış yüklenemedi.' });
    }
};

exports.gonderiSil = async (req, res) => {
    try {
        const { id } = req.params;
        const kullaniciId = req.userData.userId;
        const kullaniciRol = req.userData.rol;

        const gonderi = await Post.findByPk(id);

        if (!gonderi) {
            return res.status(404).json({ hata: "Gönderi bulunamadı." });
        }

        if (gonderi.kullanici_id !== kullaniciId && kullaniciRol !== 'yonetici') {
            return res.status(403).json({ hata: "Bu gönderiyi silmeye yetkiniz yok." });
        }

        await gonderi.destroy();

        res.status(200).json({ mesaj: "Gönderi başarıyla silindi." });

    } catch (error) {
        console.error(error);
        res.status(500).json({ hata: "Silme işlemi başarısız." });
    }
};