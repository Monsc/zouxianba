const express = require('express');
const router = express.Router();
const VoiceChatController = require('../controllers/VoiceChatController');
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');

// 创建语音聊天房间
router.post('/rooms', auth, VoiceChatController.createRoom);

// 获取语音聊天房间列表
router.get('/rooms', VoiceChatController.getRooms);

// 获取单个语音聊天房间
router.get('/rooms/:id', VoiceChatController.getRoom);

// 加入语音聊天房间
router.post('/rooms/:id/join', auth, VoiceChatController.joinRoom);

// 离开语音聊天房间
router.post('/rooms/:id/leave', auth, VoiceChatController.leaveRoom);

// 更新房间设置
router.patch('/rooms/:id/settings', auth, VoiceChatController.updateRoomSettings);

// 开始录制
router.post('/rooms/:id/recording/start', auth, VoiceChatController.startRecording);

// 停止录制
router.post('/rooms/:id/recording/stop', auth, VoiceChatController.stopRecording);

// 结束房间
router.post('/rooms/:id/end', auth, VoiceChatController.endRoom);

// 上传录音文件
router.post('/upload/recording', auth, upload.single('audio'), VoiceChatController.uploadRecording);

module.exports = router; 