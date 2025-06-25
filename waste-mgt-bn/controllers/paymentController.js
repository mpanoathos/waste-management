const { PrismaClient } = require('@prisma/client');
const { AppError } = require('../utils/errorHandler');
const crypto =require('crypto');
const axios = require('axios');
const PAYSPACK_APP_ID = process.env.PAYSPACK_APP_ID;
const PAYSPACK_APP_SECRET = process.env.PAYSPACK_APP_SECRET;

const prisma = new PrismaClient();

// This function generates a unique reference for each transaction.
const generateReference = () => `WMG-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;

exports.initiatePayment = async (req, res, next) => {
    try {
        const { amount, phoneNumber, description } = req.body;
        const { id: userId } = req.user;

        if (!amount || !phoneNumber) {
            return next(new AppError('Amount and phone number are required', 400));
        }

        const tx_ref = generateReference();

        // 1. Obtain access token
        const authResponse = await axios.post('https://payments.paypack.rw/api/auth/agents/authorize', {
            client_id: PAYSPACK_APP_ID,
            client_secret: PAYSPACK_APP_SECRET,
        });
        const accessToken = authResponse.data?.access;
        if (!accessToken) {
            return next(new AppError('Failed to obtain Paypack access token', 500));
        }

        // 2. Initiate cashin (deposit)
        const response = await axios.post(
            'https://payments.paypack.rw/api/transactions/cashin',
            {
                amount:parseFloat(amount),
                number: phoneNumber,
            },
            {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json',
                },
            }
        );

        // Create a pending payment record in our database
        const payment = await prisma.payment.create({
            data: {
                userId,
                amount: parseFloat(amount),
                status: 'PENDING',
                referenceId: tx_ref, // Use our internal reference
                providerReference: response.data.ref, // Use Paypack transaction ref
            }
        });

        res.status(200).json({
            message: 'Payment initiated successfully. Please authorize the transaction on your phone.',
            payment: {
                id: payment.id,
                referenceId: tx_ref,
                status: 'PENDING',
            }
        });
    } catch (error) {
        if (error.response) {
            // HTTP error from Paypack
            console.error('Paypack error response:', error.response.data);
            console.error('Paypack error status:', error.response.status);
            console.error('Paypack error headers:', error.response.headers);
        } else if (error.request) {
            // No response received (network error, timeout, etc.)
            console.error('No response received from Paypack:', error.request);
        } else {
            // Other errors (e.g., code bugs)
            console.error('Error setting up Paypack request:', error.message);
        }
        console.error('Payment initiation failed:', error);
        return next(new AppError(error.message || 'Failed to initiate payment', 500));
    }
};

exports.getPaymentStatus = async (req, res, next) => {
    try {
        const { paymentId } = req.params;
        const userId = req.user.id;

        // Get payment record
        const payment = await prisma.payment.findFirst({
            where: {
                id: parseInt(paymentId),
                userId
            }
        });

        if (!payment) {
            throw new AppError('Payment not found', 404);
        }

        // Check status with Paypack
        const PAYSPACK_APP_ID = process.env.PAYSPACK_APP_ID;
        const PAYSPACK_APP_SECRET = process.env.PAYSPACK_APP_SECRET;
        const authResponse = await axios.post('https://payments.paypack.rw/api/auth/agents/authorize', {
            client_id: PAYSPACK_APP_ID,
            client_secret: PAYSPACK_APP_SECRET,
        });
        const accessToken = authResponse.data?.access_token;
        if (!accessToken) {
            throw new AppError('Failed to obtain Paypack access token', 500);
        }

        const ref = payment.providerReference;
        const statusResponse = await axios.get(`https://payments.paypack.rw/api/transactions/find/${ref}`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            }
        });
        const paypackStatus = statusResponse.data.status;
        let newStatus = payment.status;
        if (paypackStatus && paypackStatus.toUpperCase() !== payment.status) {
            if (paypackStatus.toUpperCase() === 'SUCCESS') newStatus = 'SUCCESS';
            else if (paypackStatus.toUpperCase() === 'FAILED') newStatus = 'FAILED';
            else if (paypackStatus.toUpperCase() === 'PENDING') newStatus = 'PENDING';
            else if (paypackStatus.toUpperCase() === 'CANCELLED') newStatus = 'FAILED';
            await prisma.payment.update({
                where: { id: payment.id },
                data: { status: newStatus }
            });
        }

        res.status(200).json({
            payment: {
                id: payment.id,
                amount: payment.amount,
                status: newStatus,
                referenceId: payment.referenceId
            }
        });
    } catch (error) {
        console.error('Failed to get payment status:', error);
        return next(new AppError('Failed to get payment status', 500));
    }
};

exports.getUserPayments = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const payments = await prisma.payment.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ payments });
    } catch (error) {
        console.error('Failed to get user payments:', error);
        return next(new AppError('Failed to get payment history', 500));
    }
};

// Test payment endpoint (for development)
exports.testPayment = async (req, res) => {
    try {
        const { amount, phoneNumber } = req.body;
        
        if (!amount || !phoneNumber) {
            return res.status(400).json({
                error: 'Amount and phone number are required'
            });
        }

        // Create a test payment record
        const payment = await prisma.payment.create({
            data: {
                userId: req.user.id,
                amount: parseFloat(amount),
                status: 'PENDING',
                referenceId: `TEST-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
            }
        });

        res.status(200).json({
            message: 'Test payment created successfully',
            payment: {
                id: payment.id,
                amount: payment.amount,
                status: payment.status,
                referenceId: payment.referenceId
            }
        });
    } catch (error) {
        console.error('Test payment error:', error);
        res.status(500).json({
            error: 'Failed to create test payment',
            message: error.message
        });
    }
};

exports.initiatePayspackPayment = async (req, res) => {
  try {
    const { amount, phone } = req.body;
    // 1. Obtain access token
    const PAYSPACK_APP_ID = process.env.PAYSPACK_APP_ID;
    const PAYSPACK_APP_SECRET = process.env.PAYSPACK_APP_SECRET;
    const authResponse = await axios.post('https://payments.paypack.rw/api/auth/agents/authorize', {
      client_id: PAYSPACK_APP_ID,
      client_secret: PAYSPACK_APP_SECRET,
    });
    const accessToken = authResponse.data?.access_token;
    if (!accessToken) {
      return res.status(500).json({ error: 'Failed to obtain Paypack access token' });
    }
    // 2. Initiate cashin (deposit)
    const response = await axios.post(
      'https://payments.paypack.rw/api/transactions/cashin',
      {
        amount,
        number: phone,
      },
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.response?.data || error.message });
  }
};

// Get all payments for a company (COMPANY role only)
exports.getCompanyPayments = async (req, res, next) => {
    try {
        if (req.user.role !== 'COMPANY') {
            return res.status(403).json({
                message: 'Access denied. Only companies can view their payment history.'
            });
        }
        const companyId = req.user.id;
        const payments = await prisma.payment.findMany({
            where: { userId: companyId },
            orderBy: { createdAt: 'desc' }
        });
        res.status(200).json({ payments });
    } catch (error) {
        console.error('Failed to get company payments:', error);
        return next(new AppError('Failed to get company payment history', 500));
    }
};

// Admin payment report
exports.getAdminPaymentReport = async (req, res) => {
  try {
    const totalPayments = await prisma.payment.count();
    const totalAmount = await prisma.payment.aggregate({ _sum: { amount: true } });
    const paymentsByStatus = await prisma.payment.groupBy({
      by: ['status'],
      _count: { status: true },
      _sum: { amount: true }
    });
    const recentPayments = await prisma.payment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 10,
      include: { user: { select: { id: true, name: true, email: true } }, company: { select: { id: true, name: true, email: true } } }
    });
    res.json({
      totalPayments,
      totalAmount: totalAmount._sum.amount || 0,
      paymentsByStatus,
      recentPayments
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate payment report', details: error.message });
  }
}; 