const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Fallback responses for when Ollama is not available
const fallbackResponses = [
    "I can help you with waste management questions. What would you like to know?",
    "I'm here to assist with recycling and environmental sustainability. How can I help?",
    "Need information about waste collection? I'm here to help!",
    "I can provide guidance on proper waste disposal and recycling practices.",
    "Let me help you with your waste management questions."
];

const handleChatMessage = async (req, res) => {
    try {
        const { message } = req.body;
        const userId = req.user.id;

        if (!message || message.trim() === '') {
            return res.status(400).json({ error: 'Message cannot be empty' });
        }

        // Save the user's message to the database
        await prisma.chatMessage.create({
            data: {
                content: message,
                sender: 'USER',
                userId: userId
            }
        });

        let aiResponse = '';

        try {
            // Get AI response using Ollama local API (streaming)
            const ollamaRes = await axios({
                method: 'post',
                url: 'http://localhost:11434/api/chat',
                data: {
                    model: 'llama2', // or another model you have pulled
                    messages: [
                        {
                            role: "system",
                            content: "You are a helpful assistant for a waste management system. You can help users with information about waste collection, recycling, and environmental sustainability. Keep your responses concise and relevant to waste management topics."
                        },
                        {
                            role: "user",
                            content: message
                        }
                    ]
                },
                responseType: 'stream'
            });

            let buffer = '';

            await new Promise((resolve) => {
                ollamaRes.data.on('data', (chunk) => {
                    buffer += chunk.toString();
                    let boundary = buffer.indexOf('\n');
                    while (boundary !== -1) {
                        const line = buffer.substring(0, boundary).trim();
                        buffer = buffer.substring(boundary + 1);
                        if (line) {
                            try {
                                const parsed = JSON.parse(line);
                                if (parsed.message && parsed.message.content) {
                                    aiResponse += parsed.message.content;
                                }
                                if (parsed.done) {
                                    // End of stream
                                    resolve();
                                }
                            } catch (e) {
                                // Ignore parse errors for incomplete lines
                            }
                        }
                        boundary = buffer.indexOf('\n');
                    }
                });
                ollamaRes.data.on('end', resolve);
            });

            if (!aiResponse) {
                console.error('No AI response received from Ollama.');
                aiResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
            }
        } catch (ollamaError) {
            console.error('Ollama API error:', ollamaError);
            // Use a fallback response if Ollama fails
            aiResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
        }

        // Save the AI response to the database
        await prisma.chatMessage.create({
            data: {
                content: aiResponse,
                sender: 'AI',
                userId: userId
            }
        });

        res.json({ response: aiResponse });
    } catch (error) {
        console.error('Chat error:', error);
        
        // Check for specific error types
        if (error.code === 'P2002') {
            return res.status(400).json({ error: 'Database constraint error' });
        }
        
        if (error.name === 'PrismaClientKnownRequestError') {
            return res.status(400).json({ error: 'Database error occurred' });
        }

        // Generic error response
        res.status(500).json({ 
            error: 'Failed to process chat message',
            details: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = {
    handleChatMessage
}; 