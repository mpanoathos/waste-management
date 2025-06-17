const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { handleChatMessage } = require('../controllers/chatController');

router.post('/', authenticateToken, handleChatMessage);

module.exports = router; 