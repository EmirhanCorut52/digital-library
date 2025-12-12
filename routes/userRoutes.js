const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/takip-et', authMiddleware, userController.takipEt);
router.post('/takibi-birak', authMiddleware, userController.takibiBirak);

router.get('/profil/:id', userController.profilGetir);

module.exports = router;