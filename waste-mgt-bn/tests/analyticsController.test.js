const express = require('express');
const request = require('supertest');
const analyticsController = require('../controllers/analyticsController');

// Mock Prisma
jest.mock('@prisma/client', () => {
  const mPrisma = {
    bin: {
      count: jest.fn().mockResolvedValue(5),
      groupBy: jest.fn().mockResolvedValue([{ status: 'EMPTY', _count: { status: 3 } }]),
      aggregate: jest.fn().mockResolvedValue({ _avg: { fillLevel: 50 } }),
    },
    collectionHistory: {
      count: jest.fn().mockResolvedValue(10),
      groupBy: jest.fn().mockResolvedValue([]),
      findMany: jest.fn().mockResolvedValue([]),
    },
    user: {
      count: jest.fn().mockResolvedValue(20),
      groupBy: jest.fn().mockResolvedValue([{ role: 'USER', _count: { role: 15 } }]),
      findUnique: jest.fn().mockResolvedValue(null),
    },
    $queryRaw: jest.fn().mockResolvedValue([]),
  };
  return { PrismaClient: jest.fn(() => mPrisma) };
});

describe('analyticsController', () => {
  let app;
  beforeAll(() => {
    app = express();
    app.use(express.json());
    // Middleware to mock req.user for company/user endpoints
    app.use((req, res, next) => {
      req.user = { id: 1 };
      next();
    });
    app.get('/analytics', analyticsController.getSystemReport);
    app.get('/company-analytics', analyticsController.getCompanyAnalytics);
    app.get('/dashboard-analytics', analyticsController.getDashboardAnalytics);
  });

  it('should return system analytics report', async () => {
    const res = await request(app).get('/analytics');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalBins', 5);
    expect(res.body).toHaveProperty('totalCollections', 10);
    expect(res.body).toHaveProperty('totalUsers', 20);
    expect(res.body).toHaveProperty('binsByStatus');
    expect(res.body).toHaveProperty('avgFillLevel', 50);
    expect(res.body).toHaveProperty('collectionsLast7Days', 10);
    expect(res.body).toHaveProperty('usersThisMonth', 20);
    expect(res.body).toHaveProperty('usersByRole');
    expect(res.body).toHaveProperty('mostActiveCollector', null);
    expect(res.body).toHaveProperty('recentCollections');
    expect(res.body).toHaveProperty('collectionsByDay');
    expect(res.body).toHaveProperty('delayedCollections');
  });

  it('should return company analytics', async () => {
    const res = await request(app).get('/company-analytics');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('totalBins', 5);
    expect(res.body).toHaveProperty('totalCollections', 10);
    expect(res.body).toHaveProperty('binsByStatus');
    expect(res.body).toHaveProperty('recentCollections');
  });

  it('should return dashboard analytics', async () => {
    await new Promise((resolve, reject) => {
      jest.isolateModules(async () => {
        jest.doMock('@prisma/client', () => {
          const mPrisma = {
            collectionHistory: {
              findMany: jest.fn().mockResolvedValue([]),
              count: jest.fn().mockResolvedValue(10),
            },
            bin: {
              count: jest.fn().mockResolvedValue(5),
            },
            user: {
              count: jest.fn().mockResolvedValue(20),
            },
            $queryRaw: jest.fn().mockResolvedValue([]),
          };
          return { PrismaClient: jest.fn(() => mPrisma) };
        });
        const freshController = require('../controllers/analyticsController');
        const freshApp = express();
        freshApp.use(express.json());
        freshApp.use((req, res, next) => { req.user = { id: 1 }; next(); });
        freshApp.get('/dashboard-analytics', freshController.getDashboardAnalytics);
        try {
          const res = await request(freshApp).get('/dashboard-analytics');
          expect(res.statusCode).toBe(200);
          expect(res.body).toHaveProperty('dailyCollections');
          expect(res.body).toHaveProperty('totalCollections', 10);
          expect(res.body).toHaveProperty('totalBins', 5);
          expect(res.body).toHaveProperty('totalUsers', 20);
          resolve();
        } catch (err) {
          reject(err);
        }
      });
    });
  });
}); 