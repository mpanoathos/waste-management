# n8n Integration Guide for Waste Management System

## Overview
This guide explains how to integrate your waste management system with n8n automation workflows using the webhook endpoints, including AI assistant message processing.

## Available Webhook Endpoints

### Base URL
```
http://localhost:5000/webhook
```

### Data Retrieval Endpoints

#### 1. Health Check
- **URL**: `GET /webhook/health`
- **Purpose**: Verify the system is running and database is connected
- **Response**: System status and version information

#### 2. All Bins Data
- **URL**: `GET /webhook/bins`
- **Purpose**: Get all bins with user information
- **Use Case**: Inventory management, system overview

#### 3. Full Bins Only
- **URL**: `GET /webhook/bins/full`
- **Purpose**: Get bins that are 80% or more full
- **Use Case**: Collection scheduling, urgent alerts

#### 4. Recent Collections
- **URL**: `GET /webhook/collections?days=7`
- **Purpose**: Get collection history for specified period
- **Parameters**: `days` (default: 7)
- **Use Case**: Performance tracking, route optimization

#### 5. Pending Collection Requests
- **URL**: `GET /webhook/requests/pending`
- **Purpose**: Get bins that users have requested for collection
- **Use Case**: Customer service, collection prioritization

#### 6. Active Reports
- **URL**: `GET /webhook/reports/active`
- **Purpose**: Get open report threads from users
- **Use Case**: Customer support, issue tracking

#### 7. Analytics Summary
- **URL**: `GET /webhook/analytics/summary?days=30`
- **Purpose**: Get system overview statistics
- **Parameters**: `days` (default: 30)
- **Use Case**: Reporting, dashboard updates

### 🤖 AI Assistant Integration Endpoints

#### 8. Receive AI Message
- **URL**: `POST /webhook/ai/message`
- **Purpose**: Process messages from AI assistants
- **Use Case**: Automated collection requests, reports, bin updates

**Request Body:**
```json
{
  "message": "Bin #123 is 95% full and needs immediate collection",
  "action": "collection_request",
  "binId": "123",
  "priority": "HIGH",
  "userId": "456",
  "metadata": {
    "source": "ai_assistant",
    "confidence": 0.95,
    "model": "gpt-4"
  }
}
```

**Available Actions:**
- `collection_request` - Create collection request (requires binId)
- `report` - Create new report thread
- `chat_message` - Store in chat history
- `bin_update` - Update bin information (requires binId)
- `null/undefined` - Just log the message

#### 9. Get AI-Generated Content
- **URL**: `GET /webhook/ai/content?type=collection_requests&limit=50`
- **Purpose**: Retrieve AI-generated content
- **Parameters**: 
  - `type`: `collection_requests`, `reports`, `chat_messages`, or omit for summary
  - `limit`: Number of records (default: 50)
- **Use Case**: Monitor AI activity, audit AI-generated content

## Setting Up n8n Workflows

### Step 1: Install n8n
```bash
npm install -g n8n
n8n start
```

### Step 2: Create Your First Workflow

1. **Open n8n**: Navigate to `http://localhost:5678`
2. **Create New Workflow**: Click "Create new workflow"
3. **Add HTTP Request Node**: 
   - Search for "HTTP Request" in the nodes panel
   - Drag it to the canvas
   - Configure the node:
     - Method: GET
     - URL: `http://localhost:5000/webhook/bins/full`
     - Response Format: JSON

### Step 3: Example Workflows

#### Workflow 1: Daily Full Bins Alert
1. **Trigger**: Schedule (every day at 8 AM)
2. **HTTP Request**: Get full bins
3. **Filter**: Check if count > 0
4. **Email/Slack**: Send alert with bin details

#### Workflow 2: Weekly Collection Report
1. **Trigger**: Schedule (every Monday at 9 AM)
2. **HTTP Request**: Get analytics summary
3. **HTTP Request**: Get recent collections
4. **Email**: Send weekly report

#### Workflow 3: Customer Service Alert
1. **Trigger**: Schedule (every 30 minutes)
2. **HTTP Request**: Get active reports
3. **Filter**: Check if count > 0
4. **Slack/Email**: Alert customer service team

### 🤖 AI Assistant Workflows

#### Workflow 4: AI-Generated Collection Request
1. **Trigger**: Webhook (from AI assistant)
2. **HTTP Request**: POST to `/webhook/ai/message`
3. **Body**: 
   ```json
   {
     "message": "{{ $json.message }}",
     "action": "collection_request",
     "binId": "{{ $json.binId }}",
     "priority": "{{ $json.priority }}"
   }
   ```
4. **Notification**: Alert collection team

#### Workflow 5: AI Message Processing
1. **Trigger**: Schedule (every 5 minutes)
2. **HTTP Request**: Get AI-generated content
3. **Filter**: Check for new AI requests
4. **HTTP Request**: Process with AI assistant
5. **HTTP Request**: POST result to `/webhook/ai/message`

#### Workflow 6: AI-Powered Bin Monitoring
1. **Trigger**: Schedule (every hour)
2. **HTTP Request**: Get all bins data
3. **Code Node**: Analyze bin fullness with AI logic
4. **HTTP Request**: POST AI recommendations to `/webhook/ai/message`
5. **Notification**: Send AI insights to management

## AI Message Processing Examples

### Example 1: Collection Request from AI
```json
{
  "message": "Bin located at 123 Main St is 95% full and requires immediate collection. The bin has been full for 2 days.",
  "action": "collection_request",
  "binId": "123",
  "priority": "URGENT",
  "metadata": {
    "source": "ai_vision_system",
    "confidence": 0.98,
    "fullness_detected": 95,
    "location": "123 Main St"
  }
}
```

### Example 2: AI-Generated Report
```json
{
  "message": "Multiple bins in District A are showing unusual fill patterns. This may indicate a collection route optimization opportunity.",
  "action": "report",
  "metadata": {
    "source": "ai_analytics",
    "analysis_type": "pattern_detection",
    "affected_districts": ["District A"],
    "recommendation": "route_optimization"
  }
}
```

### Example 3: Bin Update from AI
```json
{
  "message": "Bin #456 is now 75% full",
  "action": "bin_update",
  "binId": "456",
  "metadata": {
    "source": "ai_sensor",
    "previous_fullness": 60,
    "change_rate": "moderate"
  }
}
```

## Response Format

All endpoints return data in this format:
```json
{
  "success": true,
  "data": [...],
  "timestamp": "2024-01-01T00:00:00.000Z",
  "count": 5
}
```

AI message endpoints include additional fields:
```json
{
  "success": true,
  "data": {...},
  "timestamp": "2024-01-01T00:00:00.000Z",
  "action": "collection_request",
  "message": "AI message processed successfully"
}
```

## Error Handling

If an endpoint fails, you'll receive:
```json
{
  "success": false,
  "error": "Error description",
  "details": "Additional error details for AI endpoints"
}
```

## Security Considerations

- Webhook endpoints are public (no authentication required)
- Consider implementing rate limiting for production
- Monitor webhook usage for unusual patterns
- Use HTTPS in production environments
- Validate AI message content before processing

## Production Deployment

When deploying to production:

1. **Update URLs**: Change `localhost:5000` to your production domain
2. **HTTPS**: Use HTTPS for all webhook calls
3. **Environment Variables**: Store URLs in n8n environment variables
4. **Monitoring**: Set up alerts for webhook failures
5. **AI Validation**: Implement content validation for AI messages

## Example n8n Node Configuration

### HTTP Request Node for AI Message
```json
{
  "method": "POST",
  "url": "http://localhost:5000/webhook/ai/message",
  "body": {
    "message": "{{ $json.message }}",
    "action": "{{ $json.action }}",
    "binId": "{{ $json.binId }}",
    "priority": "{{ $json.priority }}"
  },
  "responseFormat": "json"
}
```

### Filter Node for AI Alerts
```json
{
  "conditions": {
    "string": [
      {
        "value1": "={{ $json.action }}",
        "operation": "equals",
        "value2": "collection_request"
      }
    ]
  }
}
```

## Testing Your Integration

1. **Test Health Check**: `curl http://localhost:5000/webhook/health`
2. **Test Full Bins**: `curl http://localhost:5000/webhook/bins/full`
3. **Test AI Message**: 
   ```bash
   curl -X POST http://localhost:5000/webhook/ai/message \
     -H "Content-Type: application/json" \
     -d '{
       "message": "Test AI message",
       "action": "collection_request",
       "binId": "1",
       "priority": "NORMAL"
     }'
   ```
4. **Test AI Content**: `curl "http://localhost:5000/webhook/ai/content?type=collection_requests"`

## Next Steps

1. Start with simple workflows (health check, basic data retrieval)
2. Add AI message processing workflows
3. Implement AI-powered automation (bin monitoring, route optimization)
4. Add filtering and conditional logic
5. Integrate with notification systems (email, Slack, SMS)
6. Create complex workflows with multiple data sources
7. Set up monitoring and error handling

## Support

If you encounter issues:
1. Check the server logs for errors
2. Verify the webhook endpoints are accessible
3. Test with curl or Postman first
4. Check n8n execution logs for detailed error information
5. Validate AI message format and required fields 