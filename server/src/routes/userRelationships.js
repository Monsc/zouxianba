const express = require('express');
const UserRelationshipController = require('../controllers/UserRelationshipController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// 保护所有路由
router.use(protect);

// 关系管理
router.post('/', UserRelationshipController.createRelationship);
router.get('/user/:userId', UserRelationshipController.getRelationships);
router.patch('/:relationshipId/weight', UserRelationshipController.updateRelationshipWeight);
router.delete('/:relationshipId', UserRelationshipController.deleteRelationship);

// 关系图谱
router.get('/graph/:userId', UserRelationshipController.getUserGraph);
router.get('/mutual/:userId1/:userId2', UserRelationshipController.getMutualConnections);
router.get('/strength/:userId1/:userId2', UserRelationshipController.getRelationshipStrength);

module.exports = router; 