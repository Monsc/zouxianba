const express = require('express');
const { Message } = require('../models/Message');
const { User } = require('../models/User');
const { auth } = require('../middleware/auth');
const { catchAsync } = require('../middleware/errorHandler');
const { upload } = require('../middleware/upload');

const router = express.Router();

// ...（此处省略，内容为 messages.ts 逻辑，类型全部去除，import 改为 require，export default router 改为 module.exports = router）

module.exports = router; 