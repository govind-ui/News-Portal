const express = require('express');
const router = express.Router();
const { getNews, getNewsById, createNews, getDashboardStats, updateNews, deleteNews, addComment } = require('../controllers/newsController');
const { protect, adminOrSubAdmin } = require('../middlewares/authMiddleware');

router.route('/')
  .get(getNews)
  .post(protect, adminOrSubAdmin, createNews);

router.route('/dashboard/stats')
  .get(protect, adminOrSubAdmin, getDashboardStats);

router.route('/:id')
  .get(getNewsById)
  .put(protect, adminOrSubAdmin, updateNews)
  .delete(protect, adminOrSubAdmin, deleteNews);

router.route('/:id/comments')
  .post(protect, addComment);

module.exports = router;
