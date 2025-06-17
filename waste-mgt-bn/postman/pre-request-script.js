// Pre-request Script for MoMo API Authentication
const crypto = require('crypto');

// Get the current timestamp in ISO format
const timestamp = new Date().toISOString();
pm.variables.set('X_TIMESTAMP', timestamp);

// Generate a random nonce
const nonce = crypto.randomBytes(16).toString('hex');
pm.variables.set('X_NONCE', nonce);

// Generate a unique reference ID
const referenceId = `REF-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
pm.variables.set('X_REFERENCE_ID', referenceId);

// Get API credentials from environment variables
const apiKey = pm.variables.get('MOMO_API_KEY');
const apiSecret = pm.variables.get('MOMO_API_SECRET');

// Generate the signature
const message = `${apiKey}&${timestamp}&${nonce}`;
const signature = crypto.createHmac('sha256', apiSecret)
    .update(message)
    .digest('base64');

// Set the authorization header
pm.variables.set('AUTH_SIGNATURE', signature); 