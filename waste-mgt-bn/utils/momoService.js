const axios = require('axios');
const crypto = require('crypto');

class MomoService {
    constructor() {
        this.baseUrl = process.env.MOMO_API_URL || 'https://sandbox.momodeveloper.mtn.com';
        this.subscriptionKey = process.env.MOMO_SUBSCRIPTION_KEY;
        this.apiKey = process.env.MOMO_API_KEY;
        this.apiSecret = process.env.MOMO_API_SECRET;
        this.callbackHost = process.env.MOMO_CALLBACK_HOST || 'http://localhost:5000';
    }

    // Generate a unique reference ID for the transaction
    generateReferenceId() {
        return `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    // Generate the authorization header
    generateAuthHeader() {
        const timestamp = new Date().toISOString();
        const nonce = crypto.randomBytes(16).toString('hex');
        const signature = this.generateSignature(timestamp, nonce);

        return {
            'Authorization': `Bearer ${signature}`,
            'X-Reference-Id': this.generateReferenceId(),
            'X-Timestamp': timestamp,
            'X-Nonce': nonce,
            'Ocp-Apim-Subscription-Key': this.subscriptionKey,
            'Content-Type': 'application/json'
        };
    }

    // Generate the signature for authentication
    generateSignature(timestamp, nonce) {
        const message = `${this.apiKey}&${timestamp}&${nonce}`;
        return crypto.createHmac('sha256', this.apiSecret)
            .update(message)
            .digest('base64');
    }

    // Request to pay
    async requestToPay(amount, phoneNumber, description) {
        try {
            const referenceId = this.generateReferenceId();
            const headers = this.generateAuthHeader();
            headers['X-Reference-Id'] = referenceId;

            const payload = {
                amount: amount.toString(),
                currency: 'EUR',
                externalId: referenceId,
                payer: {
                    partyIdType: 'MSISDN',
                    partyId: phoneNumber
                },
                payerMessage: description,
                payeeNote: description
            };

            const response = await axios.post(
                `${this.baseUrl}/collection/v1_0/requesttopay`,
                payload,
                { headers }
            );

            return {
                referenceId,
                status: response.status,
                message: 'Payment request sent successfully'
            };
        } catch (error) {
            console.error('MoMo payment request failed:', error.response?.data || error.message);
            throw new Error('Failed to initiate payment request');
        }
    }

    // Get payment status
    async getPaymentStatus(referenceId) {
        try {
            const headers = this.generateAuthHeader();
            headers['X-Reference-Id'] = referenceId;

            const response = await axios.get(
                `${this.baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
                { headers }
            );

            return {
                referenceId,
                status: response.data.status,
                message: this.getStatusMessage(response.data.status)
            };
        } catch (error) {
            console.error('Failed to get payment status:', error.response?.data || error.message);
            throw new Error('Failed to get payment status');
        }
    }

    // Get status message
    getStatusMessage(status) {
        const statusMessages = {
            'SUCCESSFUL': 'Payment completed successfully',
            'FAILED': 'Payment failed',
            'PENDING': 'Payment is pending',
            'CANCELLED': 'Payment was cancelled'
        };
        return statusMessages[status] || 'Unknown status';
    }
}

module.exports = new MomoService(); 