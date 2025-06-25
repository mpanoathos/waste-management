const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');
const fs = require('fs').promises;

const sendEmail = async (to, subject, templateName, templateData) => {
  try {
    // Validate required environment variables
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error('Email configuration missing:', {
        EMAIL_USER: process.env.EMAIL_USER ? 'Set' : 'Not set',
        EMAIL_PASS: process.env.EMAIL_PASS ? 'Set' : 'Not set'
      });
      throw new Error('Email configuration is missing. Please check your environment variables.');
    }

    // Validate required parameters
    if (!to || !subject || !templateName) {
      console.error('Missing parameters:', { to, subject, templateName });
      throw new Error('Missing required parameters for sending email');
    }

    // Check if template exists
    const templatePath = path.join(__dirname, '../emailTemplates', `${templateName}.ejs`);
    try {
      await fs.access(templatePath);
    } catch (error) {
      console.error('Template not found:', templatePath);
      throw new Error(`Email template '${templateName}' not found`);
    }

    // Render the email template
    let html;
    try {
      html = await ejs.renderFile(templatePath, templateData);
    } catch (error) {
      console.error('Template rendering error:', error);
      throw new Error('Failed to render email template');
    }

    // Configure the email transporter with better Gmail settings
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
      console.log('Email transporter verified successfully');
    } catch (error) {
      console.error('Email transporter verification failed:', error);
      
      // Provide helpful error messages for common Gmail issues
      if (error.code === 'EAUTH') {
        console.error('Gmail Authentication Error. Please check:');
        console.error('1. Use App Password instead of regular password');
        console.error('2. Enable 2-factor authentication on your Gmail account');
        console.error('3. Generate an App Password: https://myaccount.google.com/apppasswords');
        console.error('4. Make sure EMAIL_USER and EMAIL_PASS are correctly set in .env file');
        throw new Error('Gmail authentication failed. Please use App Password and check your credentials.');
      }
      
      throw new Error('Failed to verify email configuration');
    }

    // Send the email
    const mailOptions = {
      from: `"Waste Management System" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };

    console.log('Attempting to send email to:', to);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully:', {
      messageId: info.messageId,
      to: info.envelope.to,
      subject: info.envelope.subject
    });
    return info;
  } catch (error) {
    console.error('Error sending email:', {
      error: error.message,
      stack: error.stack,
      to,
      subject,
      templateName
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

// Helper function to test email configuration
const testEmailConfig = async () => {
  try {
    console.log('Testing email configuration...');
    console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set' : 'Not set');
    console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set (length: ' + process.env.EMAIL_PASS.length + ')' : 'Not set');
    
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    await transporter.verify();
    console.log('✅ Email configuration is working correctly!');
    return true;
  } catch (error) {
    console.error('❌ Email configuration test failed:', error.message);
    return false;
  }
};

module.exports = { sendEmail, testEmailConfig };