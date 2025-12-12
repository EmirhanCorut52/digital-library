const Comment = require('../models/Comment');
const Book = require('../models/Book');
const User = require('../models/User');

exports.yorumYap = async (req, res) => {
    try {
        const { kitap_id, yorum_metni, puan } = req.body;
        const kullanici_id = req.userData.userId;

        if (puan < 1 || puan > 5) {
            return res.status(400).json({ hata: 'Puan 1 ile 5 arasında olmalıdır.' });
        }

        const kitap = await Book.findByPk(kitap_id);
        if (!kitap) {
            return res.status(404).json({ hata: 'Yorum yapılacak kitap bulunamadı.' });
        }

        const yeniYorum = await Comment.create({
            kitap_id: kitap_id,
            kullanici_id: kullanici_id,
            yorum_metni: yorum_metni,
            puan: puan
        });

        res.status(201).json({
            mesaj: 'Yorumunuz başarıyla eklendi!',
            yorum: yeniYorum
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ hata: 'Yorum eklenirken bir sorun oluştu.' });
    }
};

exports.kitabinYorumlariniGetir = async (req, res) => {
    try {
        const { kitapId } = req.params;

        const yorumlar = await Comment.findAll({
            where: { kitap_id: kitapId },
            include: [{
                model: User,
                attributes: ['kullanici_adi']
            }]
        });

        res.status(200).json(yorumlar);

    } catch (error) {
        res.status(500).json({ hata: 'Yorumlar yüklenemedi.' });
    }
};