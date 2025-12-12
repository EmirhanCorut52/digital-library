const express = require('express');
const router = express.Router();
const commentController = require('../controllers/commentController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/yap', authMiddleware, commentController.yorumYap);

router.get('/kitap/:kitapId', commentController.kitabinYorumlariniGetir);

module.exports = router;