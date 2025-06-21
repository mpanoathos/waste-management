const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { handleChatMessage } = require('../controllers/chatController');

// Chat endpoint
router.post('/', authenticateToken, handleChatMessage);

// Get chat history
router.get('/history', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const messages = await prisma.chatMessage.findMany({
            where: {
                userId: userId
            },
            orderBy: {
                createdAt: 'asc'
            }
        });

        res.json(messages);
    } catch (error) {
        console.error('Error fetching chat history:', error);
        res.status(500).json({ message: 'Error fetching chat history' });
    }
});

module.exports = router; 