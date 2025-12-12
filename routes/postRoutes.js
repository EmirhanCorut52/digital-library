const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/paylas', authMiddleware, postController.gonderiOlustur);

router.get('/akis', postController.akisGetir);

router.delete('/sil/:id', authMiddleware, postController.gonderiSil);

module.exports = router;