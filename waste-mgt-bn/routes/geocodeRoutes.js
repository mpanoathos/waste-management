const express = require('express');
const axios = require('axios');
const router = express.Router();

// GET /api/geocode?address=...
router.get('/geocode', async (req, res) => {
  const { address } = req.query;
  if (!address) {
    return res.status(400).json({ message: 'Address query parameter is required.' });
  }
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: address, format: 'json' },
      headers: {
        'User-Agent': 'WasteMgtApp/1.0 (your.email@example.com)', // Replace with your info
        'Accept': 'application/json'
      }
    });
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ message: 'Geocoding failed', error: error.message });
  }
});

module.exports = router; 