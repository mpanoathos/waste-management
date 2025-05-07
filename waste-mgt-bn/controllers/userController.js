const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();
const { sendEmail } = require('../utils/emailService');
const crypto = require('crypto');

exports.registerUser = async (req, res) => {
    const { name, email, password,role } = req.body;
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role
        },
      });
  
      res.status(201).json({ message: "User registered", user });
    } catch (error) {
      console.error(error);
      res.status(400).json({ message: "Registration failed", error });
    }
  };
  

exports.loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });

    if (!user) return res.status(404).json({ message: 'User not found' });

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, {
      expiresIn: '7d',
    });

    res.status(200).json({ token, user });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.user.id; // Use the user ID from the token
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    res.json({ user });
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch user', error });
  }
};

exports.getAllUsers = async(req,res) => {
  const users = await prisma.user.findMany();
  try{
    if (!users || users.length === 0) return res.status(404).json({ message: 'User not found' });

    res.json({users})
}
catch(error){
  res.status(500).json({ message: 'Could not fetch users', error });
}
}

exports.forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { resetToken, resetTokenExpiry },
    });

    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;
    const templateData = {
      name: user.name,
      resetLink,
    };

    await sendEmail(email, 'Password Reset Request', 'passwordReset', templateData);

    res.status(200).json({ message: 'Password reset email sent' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Failed to send password reset email', error });
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;
  try{
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.userId;

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    res.status(200).json({ message: 'Password reset successfully' });
  }
  catch(error){
    res.status(500).json({ message: 'Server error', error });
  }
}