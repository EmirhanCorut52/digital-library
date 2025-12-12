const User = require('../models/User');
const Post = require('../models/Post');
const Follow = require('../models/Follow');

exports.takipEt = async (req, res) => {
    try {
        const takipEdenId = req.userData.userId;
        const takipEdilenId = req.body.kullanici_id;

        if (takipEdenId == takipEdilenId) {
            return res.status(400).json({ hata: "Kendinizi takip edemezsiniz." });
        }

        const mevcutTakip = await Follow.findOne({
            where: {
                takip_eden_id: takipEdenId,
                takip_edilen_id: takipEdilenId
            }
        });

        if (mevcutTakip) {
            return res.status(400).json({ hata: "Bu kullanıcıyı zaten takip ediyorsunuz." });
        }

        await Follow.create({
            takip_eden_id: takipEdenId,
            takip_edilen_id: takipEdilenId
        });

        res.status(200).json({ mesaj: "Kullanıcı takip edildi!" });

    } catch (error) {
        console.error(error);
        res.status(500).json({ hata: "Takip işlemi başarısız." });
    }
};

exports.takibiBirak = async (req, res) => {
    try {
        const takipEdenId = req.userData.userId;
        const takipEdilenId = req.body.kullanici_id;

        const silinecek = await Follow.destroy({
            where: {
                takip_eden_id: takipEdenId,
                takip_edilen_id: takipEdilenId
            }
        });

        if (!silinecek) {
            return res.status(400).json({ hata: "Zaten takip etmiyorsunuz." });
        }

        res.status(200).json({ mesaj: "Takipten çıkıldı." });

    } catch (error) {
        res.status(500).json({ hata: "İşlem başarısız." });
    }
};

exports.profilGetir = async (req, res) => {
    try {
        const kullaniciId = req.params.id;

        const kullanici = await User.findByPk(kullaniciId, {
            attributes: ['kullanici_id', 'kullanici_adi', 'e_posta', 'rol', 'olusturma_tarihi'],
            include: [
                {
                    model: Post,
                    attributes: ['gonderi_metni', 'olusturma_tarihi']
                }
            ]
        });

        if (!kullanici) {
            return res.status(404).json({ hata: "Kullanıcı bulunamadı." });
        }

        const takipciSayisi = await Follow.count({ where: { takip_edilen_id: kullaniciId } });
        const takipedilenSayisi = await Follow.count({ where: { takip_eden_id: kullaniciId } });

        res.status(200).json({
            profil: kullanici,
            istatistik: {
                takipci: takipciSayisi,
                takip_edilen: takipedilenSayisi
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ hata: "Profil yüklenemedi." });
    }
};