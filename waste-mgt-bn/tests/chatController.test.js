const express = require('express');
const request = require('supertest');
const chatController = require('../controllers/chatController');

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mPrisma = {
    chatMessage: {
      create: jest.fn().mockResolvedValue({}),
    },
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

// Mock axios to simulate Ollama API failure (so fallback is used)
jest.mock('axios', () => jest.fn(() => Promise.reject(new Error('Ollama not available'))));

describe('chatController', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    // Middleware to mock req.user
    app.use((req, res, next) => {
      req.user = { id: 1 };
      next();
    });
    app.post('/chat', chatController.handleChatMessage);
  });

  it('should return a fallback AI response for a valid message', async () => {
    const res = await request(app)
      .post('/chat')
      .send({ message: 'How do I recycle plastic?' });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('response');
    expect(typeof res.body.response).toBe('string');
    expect(res.body.response.length).toBeGreaterThan(0);
  });

  it('should return 400 if message is empty', async () => {
    const res = await request(app)
      .post('/chat')
      .send({ message: '' });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('error', 'Message cannot be empty');
  });
}); 