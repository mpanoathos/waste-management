const axios = require('axios');

const BASE_URL = 'http://localhost:5000/webhook';

// Test AI message processing
async function testAIMessage() {
    console.log('🤖 Testing AI Assistant Webhook Integration\n');

    try {
        // Test 1: Collection Request from AI
        console.log('1. Testing AI Collection Request...');
        const collectionRequest = await axios.post(`${BASE_URL}/ai/message`, {
            message: 'Bin #123 is 95% full and needs immediate collection. Located at 123 Main Street.',
            action: 'collection_request',
            binId: '123',
            priority: 'HIGH',
            metadata: {
                source: 'ai_vision_system',
                confidence: 0.95,
                location: '123 Main Street',
                fullness_detected: 95
            }
        });
        console.log('✅ Collection Request Result:', collectionRequest.data);

        // Test 2: AI-Generated Report
        console.log('\n2. Testing AI Report Generation...');
        const aiReport = await axios.post(`${BASE_URL}/ai/message`, {
            message: 'Multiple bins in District A are showing unusual fill patterns. This may indicate a collection route optimization opportunity.',
            action: 'report',
            metadata: {
                source: 'ai_analytics',
                analysis_type: 'pattern_detection',
                affected_districts: ['District A'],
                recommendation: 'route_optimization'
            }
        });
        console.log('✅ AI Report Result:', aiReport.data);

        // Test 3: Chat Message from AI
        console.log('\n3. Testing AI Chat Message...');
        const chatMessage = await axios.post(`${BASE_URL}/ai/message`, {
            message: 'Hello! I noticed your bin is getting full. Would you like me to schedule a collection?',
            action: 'chat_message',
            userId: '1',
            metadata: {
                source: 'ai_chatbot',
                intent: 'collection_offer',
                confidence: 0.88
            }
        });
        console.log('✅ Chat Message Result:', chatMessage.data);

        // Test 4: Bin Update from AI
        console.log('\n4. Testing AI Bin Update...');
        const binUpdate = await axios.post(`${BASE_URL}/ai/message`, {
            message: 'Bin #456 is now 75% full',
            action: 'bin_update',
            binId: '456',
            metadata: {
                source: 'ai_sensor',
                previous_fullness: 60,
                change_rate: 'moderate'
            }
        });
        console.log('✅ Bin Update Result:', binUpdate.data);

        // Test 5: Simple AI Message (logged only)
        console.log('\n5. Testing Simple AI Message...');
        const simpleMessage = await axios.post(`${BASE_URL}/ai/message`, {
            message: 'System health check completed. All sensors are functioning normally.',
            metadata: {
                source: 'ai_monitor',
                check_type: 'system_health'
            }
        });
        console.log('✅ Simple Message Result:', simpleMessage.data);

        // Test 6: Get AI-Generated Content
        console.log('\n6. Testing AI Content Retrieval...');
        const aiContent = await axios.get(`${BASE_URL}/ai/content?type=collection_requests&limit=10`);
        console.log('✅ AI Content Result:', aiContent.data);

        // Test 7: Get AI Content Summary
        console.log('\n7. Testing AI Content Summary...');
        const aiSummary = await axios.get(`${BASE_URL}/ai/content`);
        console.log('✅ AI Summary Result:', aiSummary.data);

        console.log('\n🎉 All AI webhook tests completed successfully!');

    } catch (error) {
        console.error('❌ Test failed:', error.response?.data || error.message);
    }
}

// Test data retrieval endpoints
async function testDataEndpoints() {
    console.log('\n📊 Testing Data Retrieval Endpoints\n');

    try {
        // Test health check
        console.log('1. Testing Health Check...');
        const health = await axios.get(`${BASE_URL}/health`);
        console.log('✅ Health Check:', health.data);

        // Test full bins
        console.log('\n2. Testing Full Bins...');
        const fullBins = await axios.get(`${BASE_URL}/bins/full`);
        console.log('✅ Full Bins Count:', fullBins.data.count);

        // Test analytics summary
        console.log('\n3. Testing Analytics Summary...');
        const analytics = await axios.get(`${BASE_URL}/analytics/summary?days=7`);
        console.log('✅ Analytics Summary:', analytics.data.data);

        console.log('\n🎉 All data retrieval tests completed successfully!');

    } catch (error) {
        console.error('❌ Data test failed:', error.response?.data || error.message);
    }
}

// Main test function
async function runTests() {
    console.log('🚀 Starting Waste Management System Webhook Tests\n');
    
    await testDataEndpoints();
    await testAIMessage();
    
    console.log('\n✨ All tests completed!');
    console.log('\n📝 Next Steps:');
    console.log('1. Start your backend server: npm start');
    console.log('2. Run this test: node test-ai-webhook.js');
    console.log('3. Set up n8n workflows using the endpoints above');
    console.log('4. Check the N8N_INTEGRATION.md file for detailed examples');
}

// Run tests if this file is executed directly
if (require.main === module) {
    runTests().catch(console.error);
}

module.exports = { testAIMessage, testDataEndpoints }; 