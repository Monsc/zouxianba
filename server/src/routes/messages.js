const express = require('express');
const router = express.Router();
const MessageController = require('../controllers/MessageController');
const ConversationController = require('../controllers/ConversationController');
const { auth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

// 会话相关路由
router.post('/conversations', auth, ConversationController.createConversation);
router.get('/conversations', auth, ConversationController.getConversations);
router.get('/conversations/:conversationId', auth, ConversationController.getConversation);
router.patch('/conversations/:conversationId', auth, ConversationController.updateConversation);
router.delete('/conversations/:conversationId', auth, ConversationController.leaveConversation);
router.post('/conversations/:conversationId/participants', auth, ConversationController.addParticipants);
router.delete('/conversations/:conversationId/participants/:participantId', auth, ConversationController.removeParticipant);

// 消息相关路由
router.post('/conversations/:conversationId/messages', auth, upload.array('attachments', 5), MessageController.sendMessage);
router.get('/conversations/:conversationId/messages', auth, MessageController.getMessages);
router.delete('/messages/:messageId', auth, MessageController.deleteMessage);
router.patch('/messages/:messageId/recall', auth, MessageController.recallMessage);

module.exports = router; 