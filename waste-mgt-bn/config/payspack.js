const axios = require('axios');

const PAYSPACK_APP_ID = process.env.PAYSPACK_APP_ID;
const PAYSPACK_APP_SECRET = process.env.PAYSPACK_APP_SECRET;

const payspackApi = axios.create({
  baseURL: 'https://api.payspack.io/api/v1', // Update this if Payspack provides a different base URL
  headers: {
    'x-app-id': PAYSPACK_APP_ID,
    'x-app-secret': PAYSPACK_APP_SECRET,
    'Content-Type': 'application/json',
  },
});

module.exports = payspackApi; 