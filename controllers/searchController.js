const { Op } = require('sequelize');
const Book = require('../models/Book');
const Author = require('../models/Author');
const User = require('../models/User');

exports.genelArama = async (req, res) => {
    try {
        const { q } = req.query;

        if (!q) {
            return res.status(400).json({ hata: "Lütfen aranacak bir kelime girin." });
        }

        console.log(`Aranan kelime: ${q}`);

        const kitapSonuclari = await Book.findAll({
            where: {
                [Op.or]: [
                    { baslik: { [Op.like]: `%${q}%` } },
                ]
            }
        });

        const yazarSonuclari = await Author.findAll({
            where: {
                ad_soyad: { [Op.like]: `%${q}%` }
            }
        });

        const kullaniciSonuclari = await User.findAll({
            where: {
                kullanici_adi: { [Op.like]: `%${q}%` }
            },
            attributes: ['kullanici_id', 'kullanici_adi', 'rol']
        });

        res.status(200).json({
            sonuc_mesaji: `"${q}" için arama sonuçları:`,
            kitaplar: kitapSonuclari,
            yazarlar: yazarSonuclari,
            kullanicilar: kullaniciSonuclari
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ hata: "Arama işlemi sırasında hata oluştu." });
    }
};