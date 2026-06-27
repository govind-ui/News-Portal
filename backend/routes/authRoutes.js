const express = require('express');
const router = express.Router();
const { registerUser, loginUser, getProfile, getAllUsers, updateUserRole, deleteUser, createUserByAdmin } = require('../controllers/authController');
const { protect, adminOrSubAdmin, admin } = require('../middlewares/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/profile', protect, getProfile);

// Admin-only User Management Routes
router.route('/users')
  .get(protect, adminOrSubAdmin, getAllUsers)
  .post(protect, admin, createUserByAdmin);

router.route('/users/:id')
  .delete(protect, adminOrSubAdmin, deleteUser);

router.route('/users/:id/role')
  .put(protect, adminOrSubAdmin, updateUserRole);

module.exports = router;
