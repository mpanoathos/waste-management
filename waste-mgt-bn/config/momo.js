require('dotenv').config();

const momoConfig = {
    // API URLs
    baseUrl: process.env.MOMO_API_URL || 'https://sandbox.momodeveloper.mtn.com',
    callbackHost: process.env.MOMO_CALLBACK_HOST || 'http://localhost:5000',

    // API Keys
    subscriptionKey: process.env.MOMO_SUBSCRIPTION_KEY, // This is your Primary Key
    apiKey: process.env.MOMO_API_KEY,                   // This is your API User ID
    apiSecret: process.env.MOMO_API_SECRET,             // This is your Secondary Key

    // Currency
    currency: 'RWF',

    // Environment
    environment: process.env.NODE_ENV || 'development'
};

// Validate required environment variables
const requiredEnvVars = ['MOMO_SUBSCRIPTION_KEY', 'MOMO_API_KEY', 'MOMO_API_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error('Missing required MoMo environment variables:', missingEnvVars.join(', '));
    console.error('\nPlease set the following in your .env file:');
    console.error('MOMO_SUBSCRIPTION_KEY=your_primary_key_here');
    console.error('MOMO_API_KEY=your_api_user_id_here');
    console.error('MOMO_API_SECRET=your_secondary_key_here');
    process.exit(1);
}

module.exports = momoConfig; 