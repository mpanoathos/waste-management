const { PrismaClient } = require('@prisma/client');
const momoService = require('../utils/momoService');
const { AppError } = require('../utils/errorHandler');
const prisma = new PrismaClient();

exports.initiatePayment = async (req, res) => {
    try {
        const { amount, phoneNumber, description } = req.body;
        const userId = req.user.id;

        // Validate input
        if (!amount || !phoneNumber) {
            throw new AppError('Amount and phone number are required', 400);
        }

        // Create payment record
        const payment = await prisma.payment.create({
            data: {
                userId,
                amount: parseFloat(amount),
                status: 'PENDING',
                referenceId: momoService.generateReferenceId()
            }
        });

        // Initiate MoMo payment
        const momoResponse = await momoService.requestToPay(
            amount,
            phoneNumber,
            description || 'Waste Management Payment'
        );

        // Update payment record with MoMo reference
        await prisma.payment.update({
            where: { id: payment.id },
            data: {
                referenceId: momoResponse.referenceId
            }
        });

        res.status(200).json({
            message: 'Payment initiated successfully',
            payment: {
                id: payment.id,
                amount,
                status: 'PENDING',
                referenceId: momoResponse.referenceId
            }
        });
    } catch (error) {
        console.error('Payment initiation failed:', error);
        res.status(500).json({
            message: 'Failed to initiate payment',
            error: error.message
        });
    }
};

exports.getPaymentStatus = async (req, res) => {
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

        // Get status from MoMo
        const momoStatus = await momoService.getPaymentStatus(payment.referenceId);

        // Update payment status if changed
        if (momoStatus.status !== payment.status) {
            await prisma.payment.update({
                where: { id: payment.id },
                data: { status: momoStatus.status }
            });
        }

        res.status(200).json({
            payment: {
                id: payment.id,
                amount: payment.amount,
                status: momoStatus.status,
                message: momoStatus.message,
                referenceId: payment.referenceId
            }
        });
    } catch (error) {
        console.error('Failed to get payment status:', error);
        res.status(500).json({
            message: 'Failed to get payment status',
            error: error.message
        });
    }
};

exports.getUserPayments = async (req, res) => {
    try {
        const userId = req.user.id;

        const payments = await prisma.payment.findMany({
            where: { userId },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ payments });
    } catch (error) {
        console.error('Failed to get user payments:', error);
        res.status(500).json({
            message: 'Failed to get payment history',
            error: error.message
        });
    }
}; 