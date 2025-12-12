const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/kayit', authController.kayitOl);
router.post('/giris', authController.girisYap);
router.post('/sifremi-unuttum', authController.sifremiUnuttum);
router.post('/sifre-sifirla', authController.sifreSifirla);

module.exports = router;