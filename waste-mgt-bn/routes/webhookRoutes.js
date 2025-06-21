const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');

// Webhook routes for n8n integration
// These endpoints are designed to be consumed by n8n workflows

// Health check endpoint
router.get('/health', webhookController.healthCheck);

// Get all bins data
router.get('/bins', webhookController.getAllBins);

// Get only full bins (80% or more full)
router.get('/bins/full', webhookController.getFullBins);

// Get recent collection history (default: last 7 days)
// Query parameter: ?days=30 for custom period
router.get('/collections', webhookController.getRecentCollections);

// Get pending collection requests
router.get('/requests/pending', webhookController.getPendingRequests);

// Get active report threads
router.get('/reports/active', webhookController.getActiveReports);

// Get analytics summary (default: last 30 days)
// Query parameter: ?days=7 for custom period
router.get('/analytics/summary', webhookController.getAnalyticsSummary);

// NEW: Receive AI assistant messages
router.post('/ai/message', webhookController.receiveAIMessage);

// NEW: Get AI-generated content
// Query parameters: ?type=collection_requests|reports|chat_messages&limit=50
router.get('/ai/content', webhookController.getAIGeneratedContent);

// Webhook documentation endpoint
router.get('/', (req, res) => {
    res.json({
        message: 'Waste Management System Webhook API for n8n',
        version: '1.0.0',
        endpoints: {
            'GET /webhook/health': 'Health check endpoint',
            'GET /webhook/bins': 'Get all bins data',
            'GET /webhook/bins/full': 'Get only full bins (≥80%)',
            'GET /webhook/collections': 'Get recent collection history (?days=7)',
            'GET /webhook/requests/pending': 'Get pending collection requests',
            'GET /webhook/reports/active': 'Get active report threads',
            'GET /webhook/analytics/summary': 'Get analytics summary (?days=30)',
            'POST /webhook/ai/message': 'Receive AI assistant message',
            'GET /webhook/ai/content': 'Get AI-generated content (?type=collection_requests|reports|chat_messages&limit=50)'
        },
        ai_message_format: {
            description: 'POST to /webhook/ai/message with JSON body',
            required_fields: ['message'],
            optional_fields: ['userId', 'action', 'binId', 'priority', 'metadata'],
            actions: {
                'collection_request': 'Create collection request (requires binId)',
                'report': 'Create new report thread',
                'chat_message': 'Store in chat history',
                'bin_update': 'Update bin information (requires binId)',
                'null/undefined': 'Just log the message'
            },
            example: {
                message: 'Bin #123 is 95% full and needs immediate collection',
                action: 'collection_request',
                binId: '123',
                priority: 'HIGH',
                metadata: { source: 'ai_assistant', confidence: 0.95 }
            }
        },
        usage: {
            description: 'These endpoints return JSON data that can be consumed by n8n workflows',
            authentication: 'No authentication required for webhook endpoints',
            rate_limiting: 'No rate limiting applied',
            data_format: 'All responses include success status, data, timestamp, and count'
        },
        example_response: {
            success: true,
            data: [],
            timestamp: '2024-01-01T00:00:00.000Z',
            count: 0
        }
    });
});

module.exports = router; 