const { Configuration, OpenAIApi } = require('openai');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Initialize OpenAI configuration
const configuration = new Configuration({
    apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

// Fallback responses for when OpenAI is not available
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

        let aiResponse;

        try {
            // Get AI response using OpenAI
            const completion = await openai.createChatCompletion({
                model: "gpt-3.5-turbo",
                messages: [
                    {
                        role: "system",
                        content: "You are a helpful assistant for a waste management system. You can help users with information about waste collection, recycling, and environmental sustainability. Keep your responses concise and relevant to waste management topics."
                    },
                    {
                        role: "user",
                        content: message
                    }
                ],
                max_tokens: 150
            });

            aiResponse = completion.data.choices[0].message.content;
        } catch (openaiError) {
            console.error('OpenAI API error:', openaiError);
            // Use a fallback response if OpenAI fails
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