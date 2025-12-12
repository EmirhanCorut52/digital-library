const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');

router.get('/raporlar', authMiddleware, roleMiddleware, adminController.getDashboardStats);

module.exports = router;