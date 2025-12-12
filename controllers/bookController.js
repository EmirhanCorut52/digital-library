const Book = require('../models/Book');
const Author = require('../models/Author');

exports.kitapEkle = async (req, res) => {
    try {
        const { baslik, aciklama } = req.body;

        if (!baslik) {
            return res.status(400).json({ hata: 'Kitap başlığı zorunludur.' });
        }

        const yeniKitap = await Book.create({
            baslik: baslik,
            aciklama: aciklama
        });

        res.status(201).json({
            mesaj: 'Kitap başarıyla oluşturuldu!',
            kitap: yeniKitap
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ hata: 'Kitap eklenirken hata oluştu.' });
    }
};

exports.tumKitaplariGetir = async (req, res) => {
    try {
        const kitaplar = await Book.findAll();
        res.status(200).json(kitaplar);
    } catch (error) {
        res.status(500).json({ hata: 'Kitaplar getirilemedi.' });
    }
};