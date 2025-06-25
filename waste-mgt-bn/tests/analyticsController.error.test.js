const express = require('express');
const request = require('supertest');

describe('analyticsController error handling', () => {
  it('should return 500 if Prisma throws in getSystemReport', async () => {
    jest.resetModules();
    jest.doMock('@prisma/client', () => {
      const mPrisma = {
        bin: {
          count: jest.fn().mockRejectedValue(new Error('DB error')),
          groupBy: jest.fn().mockRejectedValue(new Error('DB error')),
          aggregate: jest.fn().mockRejectedValue(new Error('DB error')),
        },
        collectionHistory: {
          count: jest.fn().mockRejectedValue(new Error('DB error')),
          groupBy: jest.fn().mockRejectedValue(new Error('DB error')),
          findMany: jest.fn().mockRejectedValue(new Error('DB error')),
        },
        user: {
          count: jest.fn().mockRejectedValue(new Error('DB error')),
          groupBy: jest.fn().mockRejectedValue(new Error('DB error')),
          findUnique: jest.fn().mockRejectedValue(new Error('DB error')),
        },
        $queryRaw: jest.fn().mockRejectedValue(new Error('DB error')),
      };
      return { PrismaClient: jest.fn(() => mPrisma) };
    });
    const brokenController = require('../controllers/analyticsController');
    const errorApp = express();
    errorApp.use(express.json());
    errorApp.get('/analytics', brokenController.getSystemReport);
    const res = await request(errorApp).get('/analytics');
    expect(res.statusCode).toBe(500);
    expect(res.body).toHaveProperty('error', 'Failed to generate report');
  });
}); 