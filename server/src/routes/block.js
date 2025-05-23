const express = require('express');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');

const router = express.Router();

// ...（此处省略，内容为 block.ts 逻辑，类型全部去除，import 改为 require，export default router 改为 module.exports = router）

module.exports = router; 