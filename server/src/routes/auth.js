const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { auth } = require('../middleware/auth');
const { catchAsync, AppError } = require('../middleware/errorHandler');
const { upload } = require('../middleware/upload');
const { body, validationResult } = require('express-validator');
const AuthController = require('../controllers/AuthController');

const router = express.Router();

// Register
router.post('/register', AuthController.register);

// Login
router.post('/login', AuthController.login);

// Logout
router.post('/logout', auth, AuthController.logout);

// Logout all devices
router.post('/logout-all', auth, AuthController.logoutAll);

// Get current user
router.get('/me', auth, AuthController.getCurrentUser);

// Update user profile
router.patch('/me', auth, AuthController.updateUser);

// Delete account
router.delete('/me', auth, AuthController.deleteUser);

module.exports = router; 