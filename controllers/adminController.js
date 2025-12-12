const User = require('../models/User');
const Book = require('../models/Book');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const sequelize = require('../config/db');

exports.getDashboardStats = async (req, res) => {
    try {
        const toplamKullanici = await User.count();
        const toplamKitap = await Book.count();
        const toplamGonderi = await Post.count();
        const toplamYorum = await Comment.count();

        let enPopulerKitapAdi = "Henüz veri yok";
        let enPopulerKitapYorumSayisi = 0;

        if (toplamYorum > 0) {
            const populerKitap = await Comment.findOne({
                attributes: [
                    'kitap_id',
                    [sequelize.fn('COUNT', sequelize.col('Comment.kitap_id')), 'yorum_sayisi']
                ],
                include: [{
                    model: Book,
                    attributes: ['baslik']
                }],
                group: ['Comment.kitap_id', 'Book.kitap_id', 'Book.baslik'], 
                order: [[sequelize.literal('yorum_sayisi'), 'DESC']]
            });

            if (populerKitap && populerKitap.Book) {
                enPopulerKitapAdi = populerKitap.Book.baslik;
                enPopulerKitapYorumSayisi = populerKitap.dataValues.yorum_sayisi;
            }
        }

        res.status(200).json({
            baslik: "Yönetici Paneli Raporları",
            istatistikler: {
                kullanici_sayisi: toplamKullanici,
                kitap_sayisi: toplamKitap,
                gonderi_sayisi: toplamGonderi,
                yorum_sayisi: toplamYorum
            },
            öne_cikanlar: {
                en_cok_konusulan_kitap: enPopulerKitapAdi,
                yorum_adedi: enPopulerKitapYorumSayisi
            }
        });

    } catch (error) {
        console.error("Rapor Hatası Detayı:", error);
        res.status(500).json({ 
            hata: "Raporlar oluşturulurken hata çıktı.", 
            detay: error.message
        });
    }
};