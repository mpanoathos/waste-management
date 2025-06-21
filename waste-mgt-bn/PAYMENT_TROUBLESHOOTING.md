# Payment System Troubleshooting Guide

## 🚨 Common Payment Issues and Solutions

### 1. **Environment Variables Not Set**

**Problem:** Missing MoMo API credentials
**Symptoms:** 
- "MoMo configuration incomplete" error
- Payment initiation fails immediately

**Solution:**
Create or update your `.env` file in the `waste-mgt-bn` directory:

```env
# MoMo API Configuration
MOMO_SUBSCRIPTION_KEY=your_primary_key_here
MOMO_API_KEY=your_api_user_id_here
MOMO_API_SECRET=your_secondary_key_here
MOMO_API_URL=https://sandbox.momodeveloper.mtn.com
MOMO_CALLBACK_HOST=http://localhost:5000

# Other required variables
DATABASE_URL=your_database_url
JWT_SECRET=your_jwt_secret
```

**Get MoMo Credentials:**
1. Go to https://momodeveloper.mtn.com/
2. Create an account and register your app
3. Get your Primary Key, API User ID, and Secondary Key
4. Set up your callback URL: `http://localhost:5000/api/payments/webhook`

### 2. **Server Not Running**

**Problem:** Backend server is not started
**Symptoms:**
- "Server is not running or not accessible" error
- Frontend can't connect to payment endpoints

**Solution:**
```bash
cd waste-mgt-bn
npm install
npm start
```

### 3. **Authentication Issues**

**Problem:** Invalid or expired JWT token
**Symptoms:**
- "Authentication failed" error
- 401 Unauthorized responses

**Solution:**
1. Make sure you're logged in to the frontend
2. Check if your token is stored in localStorage
3. Try logging out and logging back in
4. Check if JWT_SECRET is set in your .env file

### 4. **MoMo API Errors**

**Problem:** Issues with MoMo API integration
**Symptoms:**
- "MoMo API Authentication failed" error
- "MoMo API Access forbidden" error
- Payment requests timeout

**Solutions:**

#### Authentication Failed (401)
- Check your API credentials in .env file
- Verify your API User ID and Secondary Key
- Make sure you're using the correct environment (sandbox vs production)

#### Access Forbidden (403)
- Check your Primary Key (Subscription Key)
- Verify your app is approved on MoMo Developer Portal
- Check if you have the correct permissions

#### Bad Request (400)
- Verify phone number format (10-12 digits)
- Check amount is greater than 0
- Ensure all required fields are provided

#### Server Error (500+)
- MoMo servers might be down
- Try again later
- Check MoMo Developer Portal status

### 5. **Database Issues**

**Problem:** Payment records not being saved
**Symptoms:**
- Payment initiated but not showing in history
- Database connection errors

**Solution:**
1. Check your DATABASE_URL in .env file
2. Run database migrations:
   ```bash
   cd waste-mgt-bn
   npx prisma migrate dev
   ```
3. Verify database connection:
   ```bash
   npx prisma db push
   ```

### 6. **Webhook Issues**

**Problem:** Payment status not updating automatically
**Symptoms:**
- Payments stuck in "PENDING" status
- No callback notifications from MoMo

**Solution:**
1. Make sure your callback URL is accessible:
   ```
   http://localhost:5000/api/payments/webhook
   ```
2. Configure this URL in your MoMo Developer Portal
3. For production, use a public URL (ngrok, etc.)

### 7. **Frontend Issues**

**Problem:** Frontend can't communicate with backend
**Symptoms:**
- CORS errors
- Network errors
- Payment form not submitting

**Solution:**
1. Check if backend is running on correct port (5000)
2. Verify CORS configuration in server.js
3. Check browser console for errors
4. Ensure frontend is making requests to correct URL

## 🧪 Testing Your Payment System

### Run the Test Script
```bash
cd waste-mgt-bn
node test-payment.js
```

### Manual Testing Steps

1. **Test Configuration:**
   ```bash
   curl http://localhost:5000/api/payments/test-config
   ```

2. **Test Health:**
   ```bash
   curl http://localhost:5000/health
   ```

3. **Test Payment Initiation (with token):**
   ```bash
   curl -X POST http://localhost:5000/api/payments/initiate \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"amount": 100, "phoneNumber": "250700000000", "description": "Test"}'
   ```

## 🔧 Debugging Tips

### 1. Check Server Logs
Look for error messages in your server console:
```bash
cd waste-mgt-bn
npm start
```

### 2. Check Browser Console
Open browser developer tools and check for:
- Network errors
- JavaScript errors
- CORS issues

### 3. Test MoMo Configuration
```bash
curl http://localhost:5000/api/payments/test-config
```

### 4. Verify Environment Variables
```bash
cd waste-mgt-bn
node -e "require('dotenv').config(); console.log('MOMO_SUBSCRIPTION_KEY:', process.env.MOMO_SUBSCRIPTION_KEY ? 'Set' : 'Missing')"
```

## 📞 Getting Help

If you're still having issues:

1. **Check the logs** - Look for specific error messages
2. **Run the test script** - Use `node test-payment.js`
3. **Verify your MoMo credentials** - Double-check on MoMo Developer Portal
4. **Check network connectivity** - Ensure your server can reach MoMo APIs
5. **Review this guide** - Make sure you've covered all the steps above

## 🔗 Useful Links

- [MoMo Developer Portal](https://momodeveloper.mtn.com/)
- [MoMo API Documentation](https://momodeveloper.mtn.com/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Documentation](https://expressjs.com/) 