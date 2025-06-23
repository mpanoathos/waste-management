const axios = require('axios');
const crypto = require('crypto');
const momoConfig = require('../config/momo');

class MomoService {
    constructor() {
        this.baseUrl = momoConfig.baseUrl;
        this.subscriptionKey = momoConfig.subscriptionKey;
        this.apiKey = momoConfig.apiKey; // This is the API User ID
        this.apiSecret = momoConfig.apiSecret; // This is the API Key/Secret
        this.callbackHost = momoConfig.callbackHost;
        
        this.accessToken = null;
        this.tokenExpiresAt = null;

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
    
    // Get and cache the OAuth2 Access Token
    async getAccessToken() {
        if (this.accessToken && this.tokenExpiresAt && new Date() < this.tokenExpiresAt) {
            console.log('♻️  Reusing existing MoMo Access Token.');
            return this.accessToken;
        }

        console.log('🔄 Requesting new MoMo Access Token...');
        const credentials = Buffer.from(`${this.apiKey}:${this.apiSecret}`).toString('base64');
        
        try {
            const response = await axios.post(
                `${this.baseUrl}/collection/token/`,
                null,
                {
                    headers: {
                        'Authorization': `Basic ${credentials}`,
                        'Ocp-Apim-Subscription-Key': this.subscriptionKey
                    },
                    timeout: 15000
                }
            );

            this.accessToken = response.data.access_token;
            // Set expiry to be 60 seconds less than actual to be safe
            this.tokenExpiresAt = new Date(new Date().getTime() + (response.data.expires_in - 60) * 1000);

            console.log('✅ New MoMo Access Token obtained.');
            return this.accessToken;

        } catch (error) {
            console.error('❌ Failed to get MoMo access token:', {
                status: error.response?.status,
                message: error.response?.data?.error_description || error.response?.data?.message || error.message,
                data: error.response?.data
            });
            throw new Error('Could not retrieve MoMo access token. Please check your API User ID and API Secret.');
        }
    }

    // Request to pay
    async requestToPay(amount, phoneNumber, description) {
        try {
            if (!amount || amount <= 0) throw new Error('Invalid amount: Amount must be greater than 0');
            if (!this.subscriptionKey || !this.apiKey || !this.apiSecret) throw new Error('MoMo configuration incomplete.');

            let formattedPhoneNumber = phoneNumber.replace(/\D/g, '');
            // Format local Rwandan numbers
            if (formattedPhoneNumber.startsWith('07') && formattedPhoneNumber.length === 10) {
                formattedPhoneNumber = '250' + formattedPhoneNumber.substring(1);
            } else if (formattedPhoneNumber.length === 9 && formattedPhoneNumber.startsWith('7')) {
                 formattedPhoneNumber = '250' + formattedPhoneNumber;
            }
            
            // Allow other formats (like the international sandbox number) to pass through
            if (!/^\d{9,15}$/.test(formattedPhoneNumber)) {
                throw new Error(`The phone number "${phoneNumber}" is not a valid format.`);
            }
            
            const accessToken = await this.getAccessToken();
            const referenceId = this.generateReferenceId();

            // Per MoMo Docs, the sandbox environment MUST use EUR currency.
            const currency = momoConfig.environment === 'development' ? 'EUR' : momoConfig.currency;
            if(momoConfig.environment === 'development') {
                console.log(`💡 Sandbox environment detected. Using currency: ${currency}`);
            }

            const payload = {
                amount: amount.toString(),
                currency: currency,
                externalId: referenceId,
                payer: {
                    partyIdType: 'MSISDN',
                    partyId: formattedPhoneNumber
                },
                payerMessage: description,
                payeeNote: description
            };
            
            console.log('Initiating MoMo payment with payload:', { ...payload, headers: { Authorization: '***hidden***' } });

            const response = await axios.post(
                `${this.baseUrl}/collection/v1_0/requesttopay`,
                payload,
                { 
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'X-Reference-Id': referenceId,
                        'X-Target-Environment': 'sandbox',
                        'Ocp-Apim-Subscription-Key': this.subscriptionKey,
                        'Content-Type': 'application/json'
                    },
                    timeout: 30000
                }
            );

            console.log('MoMo API Response:', { status: response.status, statusText: response.statusText, data: response.data });

            return { referenceId, status: response.status, message: 'Payment request sent successfully' };

        } catch (error) {
            console.error('MoMo payment request failed:');
            if (error.response) {
                console.error('   Status:', error.response.status);
                console.error('   Headers:', JSON.stringify(error.response.headers, null, 2));
                console.error('   Data:', JSON.stringify(error.response.data, null, 2));
            } else {
                console.error('   Error:', error.message);
            }
            const errorMessage = error.response?.data?.message || error.response?.data?.error_description || error.message;
            throw new Error(`MoMo payment failed: ${errorMessage}`);
        }
    }

    // Get payment status
    async getPaymentStatus(referenceId) {
        try {
            const accessToken = await this.getAccessToken();

            const response = await axios.get(
                `${this.baseUrl}/collection/v1_0/requesttopay/${referenceId}`,
                { 
                    headers: {
                        'Authorization': `Bearer ${accessToken}`,
                        'X-Target-Environment': 'sandbox',
                        'Ocp-Apim-Subscription-Key': this.subscriptionKey
                    } 
                }
            );

            console.log('Payment status response:', { status: response.status, data: response.data });
            return { referenceId, status: response.data.status, message: this.getStatusMessage(response.data.status) };

        } catch (error) {
            console.error('Failed to get payment status:');
            if (error.response) {
                console.error('   Status:', error.response.status);
                console.error('   Headers:', JSON.stringify(error.response.headers, null, 2));
                console.error('   Data:', JSON.stringify(error.response.data, null, 2));
            } else {
                console.error('   Error:', error.message);
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