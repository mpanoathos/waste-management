# Gmail Email Setup Guide

## 🚨 Current Issue
Your Gmail authentication is failing with error: `535-5.7.8 Username and Password not accepted`

## 🔧 Solution: Use App Passwords

### Step 1: Enable 2-Factor Authentication
1. Go to your Google Account settings: https://myaccount.google.com/
2. Navigate to "Security"
3. Enable "2-Step Verification" if not already enabled

### Step 2: Generate App Password
1. Go to: https://myaccount.google.com/apppasswords
2. Select "Mail" as the app
3. Select "Other (Custom name)" as device
4. Enter a name like "Waste Management System"
5. Click "Generate"
6. **Copy the 16-character password** (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update Your .env File
```env
EMAIL_USER=your.email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

**Important Notes:**
- Use your full Gmail address for `EMAIL_USER`
- Use the 16-character app password (without spaces) for `EMAIL_PASS`
- Do NOT use your regular Gmail password

### Step 4: Test Email Configuration
1. Restart your server
2. Visit: `http://localhost:5000/user/test-email`
3. Check the response and console output

## 🔍 Alternative Solutions

### Option 1: Use Gmail OAuth2 (More Secure)
If you prefer OAuth2 authentication, you can set up Gmail API credentials.

### Option 2: Use Different Email Service
Consider using services like:
- **SendGrid** (free tier available)
- **Mailgun** (free tier available)
- **AWS SES** (very cheap)

### Option 3: Use Gmail SMTP with Less Secure Apps (Not Recommended)
⚠️ **This is deprecated and not secure**
```javascript
// Only use this for testing, not production
const transporter = nodemailer.createTransporter({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});
```

## 🧪 Testing Your Setup

### Test Route
Visit: `http://localhost:5000/user/test-email`

### Manual Test
You can also test by trying to reset a password:
1. Go to your login page
2. Click "Forgot Password"
3. Enter your email
4. Check if the reset email is received

## 📋 Common Issues & Solutions

### Issue 1: "Invalid login" Error
**Solution:** Use App Password instead of regular password

### Issue 2: "Username and Password not accepted"
**Solution:** 
- Make sure 2FA is enabled
- Generate a new App Password
- Check for extra spaces in .env file

### Issue 3: "Less secure app access" Error
**Solution:** 
- Enable 2FA
- Use App Password
- Don't use "Less secure app access"

### Issue 4: Email not sending
**Solution:**
- Check console logs
- Verify .env file is loaded
- Test with the `/user/test-email` route

## 🔒 Security Best Practices

1. **Never commit .env files** to version control
2. **Use App Passwords** instead of regular passwords
3. **Enable 2FA** on your Google account
4. **Regularly rotate** App Passwords
5. **Use environment-specific** email configurations

## 📞 Getting Help

If you're still having issues:

1. **Check the console logs** for detailed error messages
2. **Test with the `/user/test-email` route**
3. **Verify your .env file** is in the correct location
4. **Ensure your Gmail account** has 2FA enabled
5. **Generate a fresh App Password**

## 🎯 Quick Fix Checklist

- [ ] Enable 2-Factor Authentication on Gmail
- [ ] Generate App Password from Google Account settings
- [ ] Update .env file with App Password
- [ ] Restart your server
- [ ] Test with `/user/test-email` route
- [ ] Try password reset functionality

---

*This guide should resolve your Gmail authentication issues. The App Password method is the recommended and secure approach for using Gmail with applications.* 