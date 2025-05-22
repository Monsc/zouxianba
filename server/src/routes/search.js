const express = require('express');
const router = express.Router();
const SearchController = require('../controllers/SearchController');
const { auth } = require('../middleware/auth');

// 综合搜索
router.get('/', auth, SearchController.search);

// 获取搜索建议
router.get('/suggestions', auth, SearchController.getSuggestions);

// 获取热门搜索
router.get('/trending', auth, SearchController.getTrending);

module.exports = router; 