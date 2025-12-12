const express = require('express');
const router = express.Router();
const bookController = require('../controllers/bookController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware')

router.post('/ekle', authMiddleware, roleMiddleware, bookController.kitapEkle);

router.get('/', bookController.tumKitaplariGetir);

module.exports = router;