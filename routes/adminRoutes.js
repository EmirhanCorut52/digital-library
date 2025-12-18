const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Legacy path (raporlar) and current path (stats) for admin dashboard
router.get(
  "/raporlar",
  authMiddleware,
  roleMiddleware,
  adminController.getDashboardStats
);

router.get(
  "/stats",
  authMiddleware,
  roleMiddleware,
  adminController.getDashboardStats
);

router.get(
  "/users",
  authMiddleware,
  roleMiddleware,
  adminController.getUsersList
);

router.put(
  "/users/:id/role",
  authMiddleware,
  roleMiddleware,
  adminController.updateUserRole
);

router.delete(
  "/users/:id",
  authMiddleware,
  roleMiddleware,
  adminController.deleteUser
);

module.exports = router;
