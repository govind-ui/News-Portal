const News = require('../models/News');

// @desc    Get all news
// @route   GET /api/news
// @access  Public
const getNews = async (req, res) => {
  try {
    const news = await News.find().populate('category', 'name').populate('author', 'name').sort({ createdAt: -1 });
    res.json(news);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single news
// @route   GET /api/news/:id
// @access  Public
const getNewsById = async (req, res) => {
  try {
    const news = await News.findById(req.params.id).populate('category', 'name').populate('author', 'name').populate('comments.user', 'name');
    if (news) {
      res.json(news);
    } else {
      res.status(404).json({ message: 'News not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const mongoose = require('mongoose');
const Category = require('../models/Category');

// @desc    Create a news article
// @route   POST /api/news
// @access  Private/Admin or Sub-Admin
const createNews = async (req, res) => {
  try {
    const { title, content, featuredImage, videoUrl, socialUrl, category, isBreaking, status } = req.body;

    if (!title || !content || !category) {
      return res.status(400).json({ message: 'Title, content, and category are required' });
    }

    let categoryId;
    if (mongoose.Types.ObjectId.isValid(category)) {
      categoryId = category;
    } else {
      // Find or create category by name case-insensitively
      let foundCategory = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
      if (!foundCategory) {
        foundCategory = await Category.create({ name: category, description: `${category} news` });
      }
      categoryId = foundCategory._id;
    }

    const news = new News({
      title,
      content,
      featuredImage: featuredImage || 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=800&q=80', // premium default fallback
      videoUrl,
      socialUrl,
      category: categoryId,
      author: req.user._id,
      isBreaking: !!isBreaking,
      status: status || 'Published',
    });

    const createdNews = await news.save();
    res.status(201).json(createdNews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const User = require('../models/User');

// @desc    Get dashboard metrics/statistics
// @route   GET /api/news/dashboard/stats
// @access  Private/Admin or Sub-Admin
const getDashboardStats = async (req, res) => {
  try {
    const totalNews = await News.countDocuments();
    const totalUsers = await User.countDocuments();
    const totalCategories = await Category.countDocuments();

    // Sum up all comments from all news posts
    const articles = await News.find({}, 'comments');
    const totalComments = articles.reduce((sum, doc) => sum + (doc.comments?.length || 0), 0);

    res.json({
      totalNews,
      totalUsers,
      totalCategories,
      totalComments,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update a news article
// @route   PUT /api/news/:id
// @access  Private/Admin or Sub-Admin
const updateNews = async (req, res) => {
  try {
    const { title, content, featuredImage, videoUrl, socialUrl, category, isBreaking, status } = req.body;

    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }

    // RBAC: Sub-Admins can only edit their own articles
    if (req.user.role === 'Sub-Admin' && news.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: Sub-Admins can only edit their own articles' });
    }

    let categoryId = news.category;
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        categoryId = category;
      } else {
        let foundCategory = await Category.findOne({ name: { $regex: new RegExp(`^${category}$`, 'i') } });
        if (!foundCategory) {
          foundCategory = await Category.create({ name: category, description: `${category} news` });
        }
        categoryId = foundCategory._id;
      }
    }

    news.title = title || news.title;
    news.content = content || news.content;
    news.featuredImage = featuredImage !== undefined ? featuredImage : news.featuredImage;
    news.videoUrl = videoUrl !== undefined ? videoUrl : news.videoUrl;
    news.socialUrl = socialUrl !== undefined ? socialUrl : news.socialUrl;
    news.category = categoryId;
    news.isBreaking = isBreaking !== undefined ? !!isBreaking : news.isBreaking;
    news.status = status || news.status;

    const updatedNews = await news.save();
    res.json(updatedNews);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a news article
// @route   DELETE /api/news/:id
// @access  Private/Admin or Sub-Admin
const deleteNews = async (req, res) => {
  try {
    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }

    // RBAC: Sub-Admins can only delete their own articles
    if (req.user.role === 'Sub-Admin' && news.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Forbidden: Sub-Admins can only delete their own articles' });
    }

    await News.deleteOne({ _id: req.params.id });
    res.json({ message: 'News article deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Add comment to a news article
// @route   POST /api/news/:id/comments
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return res.status(400).json({ message: 'Comment text is required' });
    }

    const news = await News.findById(req.params.id);
    if (!news) {
      return res.status(404).json({ message: 'News article not found' });
    }

    const newComment = {
      user: req.user._id,
      text: text.trim(),
      createdAt: new Date()
    };

    news.comments.push(newComment);
    await news.save();

    // Re-query and populate to get user name
    const updatedNews = await News.findById(req.params.id).populate('comments.user', 'name');
    res.status(201).json(updatedNews.comments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getNews, getNewsById, createNews, getDashboardStats, updateNews, deleteNews, addComment };
