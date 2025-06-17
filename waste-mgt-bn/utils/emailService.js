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

    // Configure the email transporter
    const transporter = nodemailer.createTransport({
      service: 'Gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    // Verify transporter configuration
    try {
      await transporter.verify();
      console.log('Email transporter verified successfully');
    } catch (error) {
      console.error('Email transporter verification failed:', error);
      throw new Error('Failed to verify email configuration');
    }

    // Send the email
    const mailOptions = {
      from: process.env.EMAIL_USER,
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

module.exports = { sendEmail };