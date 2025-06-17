const axios = require('axios');
const crypto = require('crypto');
const momoConfig = require('../config/momo');

class MomoService {
    constructor() {
        this.baseUrl = momoConfig.baseUrl;
        this.subscriptionKey = momoConfig.subscriptionKey;
        this.apiKey = momoConfig.apiKey;
        this.apiSecret = momoConfig.apiSecret;
        this.callbackHost = momoConfig.callbackHost;

        // Debug log configuration
        console.log('MoMo Configuration:', {
            baseUrl: this.baseUrl,
            subscriptionKey: this.subscriptionKey ? '***exists***' : '***missing***',
            apiKey: this.apiKey ? '***exists***' : '***missing***',
            apiSecret: this.apiSecret ? '***exists***' : '***missing***',
            callbackHost: this.callbackHost
        });
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

        const headers = {
            'Authorization': `Bearer ${signature}`,
            'X-Reference-Id': this.generateReferenceId(),
            'X-Timestamp': timestamp,
            'X-Nonce': nonce,
            'Ocp-Apim-Subscription-Key': this.subscriptionKey,
            'Content-Type': 'application/json'
        };

        // Debug log headers (without sensitive data)
        console.log('Generated Headers:', {
            'X-Reference-Id': headers['X-Reference-Id'],
            'X-Timestamp': headers['X-Timestamp'],
            'X-Nonce': headers['X-Nonce'],
            'Ocp-Apim-Subscription-Key': '***hidden***',
            'Authorization': '***hidden***'
        });

        return headers;
    }

    // Generate the signature for authentication
    generateSignature(timestamp, nonce) {
        const message = `${this.apiKey}&${timestamp}&${nonce}`;
        console.log('Signature Generation:', {
            message: message,
            apiKey: this.apiKey ? '***exists***' : '***missing***',
            timestamp: timestamp,
            nonce: nonce
        });

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
                currency: momoConfig.currency,
                externalId: referenceId,
                payer: {
                    partyIdType: 'MSISDN',
                    partyId: phoneNumber
                },
                payerMessage: description,
                payeeNote: description
            };

            console.log('Initiating MoMo payment with payload:', {
                ...payload,
                headers: {
                    ...headers,
                    'Ocp-Apim-Subscription-Key': '***hidden***',
                    'Authorization': '***hidden***'
                }
            });

            const response = await axios.post(
                `${this.baseUrl}/collection/v1_0/requesttopay`,
                payload,
                { headers }
            );

            console.log('MoMo API Response:', {
                status: response.status,
                statusText: response.statusText,
                data: response.data
            });

            return {
                referenceId,
                status: response.status,
                message: 'Payment request sent successfully'
            };
        } catch (error) {
            console.error('MoMo payment request failed:', {
                error: error.response?.data || error.message,
                status: error.response?.status,
                headers: error.response?.headers,
                config: {
                    url: error.config?.url,
                    method: error.config?.method,
                    headers: {
                        ...error.config?.headers,
                        'Ocp-Apim-Subscription-Key': '***hidden***',
                        'Authorization': '***hidden***'
                    }
                }
            });
            
            if (error.response?.data?.error) {
                throw new Error(`MoMo API Error: ${error.response.data.error}`);
            }
            
            throw new Error('Failed to initiate payment request');
        }
    }

    // Get payment status
    async getPaymentStatus(referenceId) {
        try {
            const headers = this.generateAuthHeader();
            headers['X-Reference-Id'] = referenceId;

            console.log('Checking payment status:', {
                referenceId,
                headers: {
                    ...headers,
                    'Ocp-Apim-Subscription-Key': '***hidden***',
                    'Authorization': '***hidden***'
                }
            });

            const response = await axios.get(
                `${this.baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
                { headers }
            );

            console.log('Payment status response:', {
                status: response.status,
                data: response.data
            });

            return {
                referenceId,
                status: response.data.status,
                message: this.getStatusMessage(response.data.status)
            };
        } catch (error) {
            console.error('Failed to get payment status:', {
                error: error.response?.data || error.message,
                status: error.response?.status,
                referenceId
            });
            
            if (error.response?.data?.error) {
                throw new Error(`MoMo API Error: ${error.response.data.error}`);
            }
            
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