const express = require('express');
const { User } = require('../models/User');
const { Post } = require('../models/Post');
const { catchAsync } = require('../middleware/errorHandler');

const router = express.Router();

// ...（此处省略，内容为 search.ts 逻辑，类型全部去除，import 改为 require，export default router 改为 module.exports = router）

module.exports = router; 