const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();
const { sendEmail } = require('../utils/emailService');
const { AppError, handleError } = require('../utils/errorHandler');
const crypto = require('crypto');

exports.registerUser = async (req, res) => {
    const { name, email, password, role, companyName, address, latitude, longitude } = req.body;
  
    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
          role,
          companyName: role === 'COMPANY' ? companyName : null,
          approvalStatus: role === 'COMPANY' ? 'PENDING' : 'APPROVED',
          address,
          latitude,
          longitude,
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
      where: {
        role: 'USER' // Only get users with USER role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phoneNumber: true,
        address: true,
        district: true,
        sector: true,
        cell: true,
        companyName: true,
        companyType: true,
        approvalStatus: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    res.status(200).json({ 
      success: true,
      users 
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch users',
      error: error.message 
    });
  }
};

exports.getAllUsersWithRoles = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phoneNumber: true,
        latitude: true,
        longitude: true,
        companyName: true,
        companyType: true,
        approvalStatus: true,
        rejectionReason: true,
        createdAt: true,
        bins: {
          select: {
            id: true,
            status: true,
            fillLevel: true,
            location: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Group users by role for better organization
    const usersByRole = {
      ADMIN: users.filter(user => user.role === 'ADMIN'),
      USER: users.filter(user => user.role === 'USER'),
      COMPANY: users.filter(user => user.role === 'COMPANY')
    };

    // Add summary statistics
    const summary = {
      total: users.length,
      admin: usersByRole.ADMIN.length,
      users: usersByRole.USER.length,
      companies: usersByRole.COMPANY.length,
      pendingCompanies: usersByRole.COMPANY.filter(user => user.approvalStatus === 'PENDING').length
    };

    res.status(200).json({ 
      success: true,
      users,
      usersByRole,
      summary
    });
  } catch (error) {
    console.error('Error fetching users with roles:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch users',
      error: error.message 
    });
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
    // Validate user ID
    if (!userId || isNaN(parseInt(userId))) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid user ID' 
      });
    }

    // Find the user's bin
    const bin = await prisma.bin.findFirst({
      where: { userId: Number(userId) }
    });

    if (!bin) {
      return res.status(404).json({ 
        success: false,
        message: 'Bin not found for user' 
      });
    }

    // Update the bin status to 'EMPTY' and fillLevel to 0
    await prisma.bin.update({
      where: { id: bin.id },
      data: {
        status: 'EMPTY',
        fillLevel: 0
      }
    });

    // Create collection history record
    const collectionHistory = await prisma.collectionHistory.create({
      data: {
        binId: bin.id,
        collectedById: req.user.id,
        notes: `Bin collected by ${req.user.name}`
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
      }
    });

    res.status(200).json({ 
      success: true,
      message: 'Bin marked as collected',
      collectionHistory
    });
  } catch (error) {
    console.error('Error marking bin as collected:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error marking bin as collected',
      error: error.message 
    });
  }
};

exports.collectBin = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId, 10);
    const collectedById = req.user.id; // Get the company user's ID from the auth token

    if (isNaN(userId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid user ID'
      });
    }

    // Find the user's bin
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { bins: true }
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.bins || user.bins.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No bin found for this user'
      });
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
        binId: binId,
        collectedById: collectedById,
        notes: `Bin collected by company user: ${req.user.name}`
      },
      include: {
        bin: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true
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
      }
    });

    res.status(200).json({ 
      success: true,
      message: 'Bin collected successfully',
      bin: updatedBin,
      collectionHistory
    });
  } catch (error) {
    console.error('Error collecting bin:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error collecting bin',
      error: error.message 
    });
  }
};

// Add a new function to get collection history (admin only)
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

    res.status(200).json({ 
      success: true,
      history 
    });
  } catch (error) {
    console.error('Error fetching collection history:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch collection history',
      error: error.message 
    });
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

    res.status(200).json({ 
      success: true,
      history 
    });
  } catch (error) {
    console.error('Error fetching user collection history:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch collection history',
      error: error.message 
    });
  }
};

// Get collection history for companies (collections performed BY the company)
exports.getCompanyCollectionHistory = async (req, res) => {
  try {
    const companyId = req.user.id; // Get company ID from the authenticated request

    // Verify the user is a company
    if (req.user.role !== 'COMPANY') {
      return res.status(403).json({
        success: false,
        message: 'Access denied. Only companies can view their collection history.'
      });
    }

    const history = await prisma.collectionHistory.findMany({
      where: {
        collectedById: companyId // Collections performed by this company
      },
      include: {
        bin: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                phoneNumber: true,
                latitude: true,
                longitude: true
              }
            }
          }
        },
        collectedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            companyName: true
          }
        }
      },
      orderBy: {
        collectedAt: 'desc'
      }
    });

    // Add summary statistics
    const summary = {
      totalCollections: history.length,
      totalUsers: new Set(history.map(record => record.bin.user.id)).size,
      totalLocations: new Set(history.map(record => record.bin.location)).size,
      thisMonth: history.filter(record => {
        const thisMonth = new Date();
        const recordDate = new Date(record.collectedAt);
        return thisMonth.getMonth() === recordDate.getMonth() && 
               thisMonth.getFullYear() === recordDate.getFullYear();
      }).length
    };

    res.status(200).json({ 
      success: true,
      history,
      summary
    });
  } catch (error) {
    console.error('Error fetching company collection history:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch company collection history',
      error: error.message 
    });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const {
      name,
      email,
      phoneNumber,
      companyName,
      companyType,
      latitude,
      longitude
    } = req.body;

    // Validate required fields
    if (!name || !email) {
      return res.status(400).json({ 
        success: false,
        message: 'Name and email are required' 
      });
    }

    // Check if email is already taken by another user
    const existingUser = await prisma.user.findFirst({
      where: {
        email: email.toLowerCase(),
        id: { not: userId }
      }
    });

    if (existingUser) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is already taken' 
      });
    }

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email: email.toLowerCase(),
        phoneNumber,
        latitude,
        longitude,
        ...(req.user.role === 'COMPANY' && {
          companyName,
          companyType
        })
      }
    });

    // Remove sensitive information before sending response
    const { password, ...userWithoutPassword } = updatedUser;

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: userWithoutPassword
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update profile',
      error: error.message
    });
  }
};

// Add new function to handle company approvals
exports.approveCompany = async (req, res) => {
  try {
    const { userId, status, reason } = req.body;
    
    if (!['APPROVED', 'REJECTED'].includes(status)) {
      return res.status(400).json({ message: 'Invalid approval status' });
    }

    // If rejecting, require a reason
    if (status === 'REJECTED' && !reason) {
      return res.status(400).json({ message: 'Rejection reason is required' });
    }

    const updateData = { 
      approvalStatus: status,
      ...(status === 'REJECTED' && { rejectionReason: reason }),
      ...(status === 'APPROVED' && { rejectionReason: null }) // Clear rejection reason if approved
    };

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    res.status(200).json({ 
      message: `Company ${status.toLowerCase()} successfully`,
      user 
    });
  } catch (error) {
    console.error('Error updating company status:', error);
    res.status(500).json({ message: 'Failed to update company status', error: error.message });
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
        latitude: true,
        longitude: true,
        createdAt: true
      }
    });

    res.status(200).json({ companies: pendingCompanies });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch pending companies', error });
  }
};

exports.getAllCompanies = async (req, res) => {
  try {
    const companies = await prisma.user.findMany({
      where: { role: 'COMPANY' },
      select: {
        id: true,
        name: true,
        email: true,
        companyName: true,
        companyType: true,
        phoneNumber: true,
        latitude: true,
        longitude: true,
        approvalStatus: true,
        rejectionReason: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ companies });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch companies', error: error.message });
  }
};

exports.getUsersForBinManagement = async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      where: {
        role: 'USER' // Only get users with USER role
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        bins: {
          select: {
            id: true,
            status: true,
            fillLevel: true,
            location: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to include binStatus
    const usersWithBinStatus = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      binStatus: user.bins && user.bins.length > 0 ? user.bins[0].status : 'EMPTY',
      binFillLevel: user.bins && user.bins.length > 0 ? user.bins[0].fillLevel : 0,
      binLocation: user.bins && user.bins.length > 0 ? user.bins[0].location : 'Unknown'
    }));

    res.status(200).json({ 
      success: true,
      users: usersWithBinStatus
    });
  } catch (error) {
    console.error('Error fetching users for bin management:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch users for bin management',
      error: error.message 
    });
  }
};