const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();
const { sendEmail } = require('../utils/emailService');
const { AppError, handleError } = require('../utils/errorHandler');
const crypto = require('crypto');

exports.registerUser = async (req, res) => {
    const { name, email, password, role } = req.body;
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          approvalStatus: role === 'COMPANY' ? 'PENDING' : 'APPROVED'
        },
      });
      
      // Only create bin for non-company users
      if (role !== 'COMPANY') {
        await prisma.bin.create({
          data: {
            location: 'Kigali',
            status: 'EMPTY',
            fillLevel: 0,
            type: 'ORGANIC',
            userId: user.id
          },
        });
      }
  
      res.status(201).json({ 
        message: role === 'COMPANY' ? "Company registration submitted for approval" : "User registered", 
        user 
      });
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

    // Check if company user is approved
    if (user.role === 'COMPANY' && user.approvalStatus !== 'APPROVED') {
      return res.status(403).json({ 
        message: 'Your company account is pending approval. Please wait for admin approval.',
        approvalStatus: user.approvalStatus
      });
    }

    const token = jwt.sign(
      { 
        userId: user.id,
        role: user.role
      }, 
      process.env.JWT_SECRET, 
      {
        expiresIn: '7d',
      }
    );

    res.status(200).json({ token, role: user.role, user });
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

exports.getAllUsers = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      include: {
        bins: true, // ✅ correct relation name
      },
    });

    // Use the first bin's status if exists, otherwise 'Unknown'
    const usersWithBinStatus = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      binStatus: user.bins[0]?.status || 'Unknown',
    }));

    if (!users || users.length === 0) return res.status(404).json({ message: 'User not found' });

    res.json({ users: usersWithBinStatus });
  } catch (error) {
    res.status(500).json({ message: 'Could not fetch users', error });
  }
};

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      throw new AppError('Email is required', 400);
    }

    // Validate FRONTEND_URL
    if (!process.env.FRONTEND_URL) {
      throw new AppError('Frontend URL is not configured', 500);
    }

    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) {
      // Return success even if user not found to prevent email enumeration
      return res.status(200).json({ message: 'If an account exists, a password reset email will be sent' });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    // Update user with reset token
    await prisma.user.update({
      where: { email: email.toLowerCase() },
      data: { 
        resetToken,
        resetTokenExpiry
      },
    });

    // Create reset link with proper URL construction
    const frontendUrl = process.env.FRONTEND_URL.replace(/\/$/, ''); // Remove trailing slash if exists
    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;
    
    console.log('Generated reset link:', resetLink); // Debug log

    // Send email
    const templateData = {
      name: user.name,
      resetLink,
    };

    try {
      await sendEmail(email, 'Password Reset Request', 'passwordReset', templateData);
    } catch (emailError) {
      // If email fails, clear the reset token
      await prisma.user.update({
        where: { email: email.toLowerCase() },
        data: { 
          resetToken: null,
          resetTokenExpiry: null
        },
      });
      throw new AppError('Failed to send reset email', 500);
    }

    res.status(200).json({ message: 'If an account exists, a password reset email will be sent' });
  } catch (error) {
    handleError(error, res);
  }
};

exports.resetPassword = async (req, res) => {
  const { token, newPassword } = req.body;

  try {
    // Validate input
    if (!token || !newPassword) {
      throw new AppError('Token and new password are required', 400);
    }

    if (newPassword.length < 8) {
      throw new AppError('Password must be at least 8 characters long', 400);
    }

    // Find user with valid reset token
    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gt: new Date() // Check if token hasn't expired
        }
      }
    });

    if (!user) {
      throw new AppError('Invalid or expired reset token', 400);
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user's password and clear reset token
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.status(200).json({ message: 'Password has been reset successfully' });
  } catch (error) {
    handleError(error, res);
  }
};

exports.collectUserBin = async (req, res) => {
  const { userId } = req.params;
  try {
    // Find the user's bin
    const bin = await prisma.bin.findFirst({
      where: { userId: Number(userId) }
    });

    if (!bin) {
      return res.status(404).json({ message: 'Bin not found for user' });
    }

    // Update the bin status to 'EMPTY' and fillLevel to 0
    await prisma.bin.update({
      where: { id: bin.id },
      data: {
        status: 'EMPTY',
        fillLevel: 0
      }
    });

    res.status(200).json({ message: 'Bin marked as collected' });
  } catch (error) {
    res.status(500).json({ message: 'Error marking bin as collected', error });
  }
};

exports.collectBin = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const collectedById = req.user.id; // Get the company user's ID from the auth token

    if (isNaN(userId)) {
      throw new AppError('Invalid user ID', 400);
    }

    // Find the user's bin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { bins: true }
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (!user.bins || user.bins.length === 0) {
      throw new AppError('No bin found for this user', 404);
    }

    const binId = user.bins[0].id;

    // First update the bin status
    const updatedBin = await prisma.bin.update({
      where: { id: binId },
      data: {
        status: 'EMPTY',
        fillLevel: 0
      }
    });

    // Then create the collection history
    const collectionHistory = await prisma.collectionHistory.create({
      data: {
        bin: {
          connect: { id: binId }
        },
        collectedBy: {
          connect: { id: collectedById }
        },
        notes: `Bin collected by company user ID: ${collectedById}`
      },
      include: {
        bin: true,
        collectedBy: true
      }
    });

    res.status(200).json({ 
      message: 'Bin collected successfully',
      bin: updatedBin,
      collectionHistory
    });
  } catch (error) {
    handleError(error, res);
  }
};

// Add a new function to get collection history
exports.getCollectionHistory = async (req, res) => {
  try {
    const history = await prisma.collectionHistory.findMany({
      include: {
        bin: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        collectedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        collectedAt: 'desc'
      }
    });

    res.status(200).json({ history });
  } catch (error) {
    handleError(error, res);
  }
};

// Get collection history for the authenticated user
exports.getUserCollectionHistory = async (req, res) => {
  try {
    const userId = req.user.id; // Get user ID from the authenticated request

    const history = await prisma.collectionHistory.findMany({
      where: {
        bin: {
          userId: userId
        }
      },
      include: {
        bin: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        collectedBy: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        collectedAt: 'desc'
      }
    });

    res.status(200).json({ history });
  } catch (error) {
    handleError(error, res);
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      email,
      phoneNumber,
      address,
      district,
      sector,
      cell,
      companyName,
      companyType
    } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ message: 'Name and email are required' });
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        id: { not: userId }
      }
    });

    if (existingUser) {
      return res.status(400).json({ message: 'Email is already taken' });
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email: email.toLowerCase(),
        phoneNumber,
        address,
        district,
        sector,
        cell,
        ...(req.user.role === 'COMPANY' && {
          companyName,
          companyType
        })
      }
    });

    // Remove sensitive information before sending response
    const { password, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Add new function to handle company approvals
exports.approveCompany = async (req, res) => {
  try {
    const { userId, status } = req.body;
    
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid approval status' });
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data: { approvalStatus: status }
    });

    res.status(200).json({ 
      message: `Company ${status.toLowerCase()} successfully`,
      user 
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to update company status', error });
  }
};

// Add new function to get pending companies
exports.getPendingCompanies = async (req, res) => {
  try {
    const pendingCompanies = await prisma.user.findMany({
      where: {
        role: 'COMPANY',
        approvalStatus: 'PENDING'
      },
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        companyType: true,
        phoneNumber: true,
        address: true,
        createdAt: true
      }
    });

    res.status(200).json({ companies: pendingCompanies });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pending companies', error });
  }
};