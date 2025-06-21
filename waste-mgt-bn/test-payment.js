const axios = require('axios');
const momoConfig = require('./config/momo');

// Test configuration
const testConfig = {
    baseUrl: 'http://localhost:5000',
    token: 'your_jwt_token_here' // Replace with actual token
};

async function testPaymentSystem() {
    console.log('🧪 Testing Payment System...\n');

    // 1. Test MoMo Configuration
    console.log('1. Testing MoMo Configuration:');
    try {
        const isValid = momoConfig.validate();
        if (isValid) {
            console.log('   ✅ MoMo configuration is valid');
            console.log('   📍 API URL:', momoConfig.baseUrl);
            console.log('   🔑 Subscription Key:', momoConfig.subscriptionKey ? '***exists***' : '❌ missing');
            console.log('   🔑 API Key:', momoConfig.apiKey ? '***exists***' : '❌ missing');
            console.log('   🔑 API Secret:', momoConfig.apiSecret ? '***exists***' : '❌ missing');
        } else {
            console.log('   ❌ MoMo configuration has issues');
            return;
        }
    } catch (error) {
        console.log('   ❌ Error checking MoMo configuration:', error.message);
        return;
    }

    // 2. Test Server Health
    console.log('\n2. Testing Server Health:');
    try {
        const response = await axios.get(`${testConfig.baseUrl}/health`);
        console.log('   ✅ Server is running');
        console.log('   📊 Status:', response.data.status);
    } catch (error) {
        console.log('   ❌ Server is not running or not accessible');
        console.log('   💡 Make sure your server is running on port 5000');
        return;
    }

    // 3. Test Payment Configuration Endpoint
    console.log('\n3. Testing Payment Configuration:');
    try {
        const response = await axios.get(`${testConfig.baseUrl}/api/payments/test-config`);
        console.log('   ✅ Payment configuration endpoint is working');
        console.log('   📋 Config:', response.data.config);
    } catch (error) {
        console.log('   ❌ Payment configuration endpoint failed:', error.response?.data?.message || error.message);
    }

    // 4. Test Authentication (if token provided)
    if (testConfig.token !== 'your_jwt_token_here') {
        console.log('\n4. Testing Authentication:');
        try {
            const response = await axios.get(`${testConfig.baseUrl}/api/payments/history`, {
                headers: { Authorization: `Bearer ${testConfig.token}` }
            });
            console.log('   ✅ Authentication is working');
            console.log('   📊 Payment history count:', response.data.payments?.length || 0);
        } catch (error) {
            console.log('   ❌ Authentication failed:', error.response?.data?.message || error.message);
        }
    } else {
        console.log('\n4. Testing Authentication:');
        console.log('   ⚠️  No token provided - skipping authentication test');
        console.log('   💡 To test with authentication, update the token in this script');
    }

    // 5. Test Payment Initiation (if token provided)
    if (testConfig.token !== 'your_jwt_token_here') {
        console.log('\n5. Testing Payment Initiation:');
        try {
            const testPayment = {
                amount: 100,
                phoneNumber: '250700000000', // Replace with test phone number
                description: 'Test payment from script'
            };

            const response = await axios.post(`${testConfig.baseUrl}/api/payments/initiate`, testPayment, {
                headers: { Authorization: `Bearer ${testConfig.token}` }
            });
            console.log('   ✅ Payment initiation is working');
            console.log('   📊 Payment ID:', response.data.payment.id);
            console.log('   🔗 Reference ID:', response.data.payment.referenceId);
        } catch (error) {
            console.log('   ❌ Payment initiation failed:', error.response?.data?.message || error.message);
        }
    } else {
        console.log('\n5. Testing Payment Initiation:');
        console.log('   ⚠️  No token provided - skipping payment initiation test');
    }

    console.log('\n🎯 Test Summary:');
    console.log('   • Check the results above for any ❌ errors');
    console.log('   • If MoMo configuration is missing, set up your .env file');
    console.log('   • If server is not running, start it with: npm start');
    console.log('   • If authentication fails, get a valid JWT token');
    console.log('   • For MoMo API issues, check your credentials at: https://momodeveloper.mtn.com/');
}

// Run the test
testPaymentSystem().catch(console.error); 