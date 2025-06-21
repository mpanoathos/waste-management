const express = require('express');
const router = express.Router();
const threadController = require('../controllers/reportThreadController');
const { authenticateToken } = require('../middleware/auth');

// User creates a new thread
router.post('/', authenticateToken, threadController.createThread);
// Admin gets all threads
router.get('/admin', authenticateToken, threadController.getThreads);
// User gets their own threads
router.get('/user', authenticateToken, threadController.getUserThreads);
// Get messages for a thread
router.get('/:id/messages', authenticateToken, threadController.getMessages);
// Add a message to a thread
router.post('/:id/message', authenticateToken, threadController.addMessage);

module.exports = router; 