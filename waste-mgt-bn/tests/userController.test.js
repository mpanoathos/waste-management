const express = require('express');
const request = require('supertest');
const userController = require('../controllers/userController');

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mPrisma = {
    user: {
      create: jest.fn().mockResolvedValue({
        id: 1,
        name: 'Test User',
        email: 'test@example.com',
        role: 'USER',
      }),
    },
    bin: {
      create: jest.fn().mockResolvedValue({}),
    },
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

describe('userController', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    app.post('/register', userController.registerUser);
  });

  it('should register a user and return 201', async () => {
    const res = await request(app)
      .post('/register')
      .send({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'USER',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('user');
    expect(res.body.user.email).toBe('test@example.com');
  });
}); 