const express = require('express');
const router = express.Router();
const { getCategories, createCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, adminOrSubAdmin } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getCategories)
  .post(protect, adminOrSubAdmin, createCategory);

router.route('/:id')
  .delete(protect, adminOrSubAdmin, deleteCategory);

module.exports = router;
