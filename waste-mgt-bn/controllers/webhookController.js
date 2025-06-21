const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Webhook controller for n8n integration
const webhookController = {
    // Get all bins data for n8n
    getAllBins: async (req, res) => {
        try {
            const bins = await prisma.bin.findMany({
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true
                        }
                    }
                }
            });

            res.json({
                success: true,
                data: bins,
                timestamp: new Date().toISOString(),
                count: bins.length
            });
        } catch (error) {
            console.error('Webhook getAllBins error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch bins data'
            });
        }
    },

    // Get full bins only
    getFullBins: async (req, res) => {
        try {
            const fullBins = await prisma.bin.findMany({
                where: {
                    fullness: {
                        gte: 80 // Bins that are 80% or more full
                    }
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true
                        }
                    }
                }
            });

            res.json({
                success: true,
                data: fullBins,
                timestamp: new Date().toISOString(),
                count: fullBins.length
            });
        } catch (error) {
            console.error('Webhook getFullBins error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch full bins data'
            });
        }
    },

    // Get recent collection history
    getRecentCollections: async (req, res) => {
        try {
            const { days = 7 } = req.query;
            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() - parseInt(days));

            const collections = await prisma.collectionHistory.findMany({
                where: {
                    collectedAt: {
                        gte: dateLimit
                    }
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    bin: {
                        select: {
                            id: true,
                            location: true
                        }
                    }
                },
                orderBy: {
                    collectedAt: 'desc'
                }
            });

            res.json({
                success: true,
                data: collections,
                timestamp: new Date().toISOString(),
                count: collections.length,
                period: `${days} days`
            });
        } catch (error) {
            console.error('Webhook getRecentCollections error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch collection history'
            });
        }
    },

    // Get pending collection requests
    getPendingRequests: async (req, res) => {
        try {
            const pendingRequests = await prisma.collectionRequest.findMany({
                where: {
                    status: 'PENDING'
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            phone: true
                        }
                    },
                    bin: {
                        select: {
                            id: true,
                            location: true,
                            fullness: true
                        }
                    }
                },
                orderBy: {
                    createdAt: 'desc'
                }
            });

            res.json({
                success: true,
                data: pendingRequests,
                timestamp: new Date().toISOString(),
                count: pendingRequests.length
            });
        } catch (error) {
            console.error('Webhook getPendingRequests error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch pending requests'
            });
        }
    },

    // Get active report threads
    getActiveReports: async (req, res) => {
        try {
            const activeReports = await prisma.reportThread.findMany({
                where: {
                    status: 'OPEN'
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true
                        }
                    },
                    messages: {
                        orderBy: {
                            createdAt: 'desc'
                        },
                        take: 1 // Get latest message
                    }
                },
                orderBy: {
                    updatedAt: 'desc'
                }
            });

            res.json({
                success: true,
                data: activeReports,
                timestamp: new Date().toISOString(),
                count: activeReports.length
            });
        } catch (error) {
            console.error('Webhook getActiveReports error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch active reports'
            });
        }
    },

    // Get analytics summary
    getAnalyticsSummary: async (req, res) => {
        try {
            const { days = 30 } = req.query;
            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() - parseInt(days));

            // Get total bins
            const totalBins = await prisma.bin.count();

            // Get full bins
            const fullBins = await prisma.bin.count({
                where: {
                    fullness: {
                        gte: 80
                    }
                }
            });

            // Get recent collections
            const recentCollections = await prisma.collectionHistory.count({
                where: {
                    collectedAt: {
                        gte: dateLimit
                    }
                }
            });

            // Get pending requests
            const pendingRequests = await prisma.collectionRequest.count({
                where: {
                    status: 'PENDING'
                }
            });

            // Get active reports
            const activeReports = await prisma.reportThread.count({
                where: {
                    status: 'OPEN'
                }
            });

            res.json({
                success: true,
                data: {
                    totalBins,
                    fullBins,
                    recentCollections,
                    pendingRequests,
                    activeReports,
                    period: `${days} days`
                },
                timestamp: new Date().toISOString()
            });
        } catch (error) {
            console.error('Webhook getAnalyticsSummary error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch analytics summary'
            });
        }
    },

    // Health check endpoint for n8n
    healthCheck: async (req, res) => {
        try {
            // Test database connection
            await prisma.$queryRaw`SELECT 1`;
            
            res.json({
                success: true,
                status: 'healthy',
                timestamp: new Date().toISOString(),
                database: 'connected',
                version: '1.0.0'
            });
        } catch (error) {
            console.error('Webhook health check error:', error);
            res.status(500).json({
                success: false,
                status: 'unhealthy',
                error: 'Database connection failed',
                timestamp: new Date().toISOString()
            });
        }
    },

    // NEW: Receive AI assistant message and process it
    receiveAIMessage: async (req, res) => {
        try {
            const { 
                message, 
                userId, 
                action, 
                binId, 
                priority = 'NORMAL',
                metadata = {} 
            } = req.body;

            if (!message) {
                return res.status(400).json({
                    success: false,
                    error: 'Message is required'
                });
            }

            let result = {};

            // Process different types of AI actions
            switch (action) {
                case 'collection_request':
                    // Create a collection request based on AI message
                    if (!binId) {
                        return res.status(400).json({
                            success: false,
                            error: 'Bin ID is required for collection requests'
                        });
                    }
                    
                    result = await prisma.collectionRequest.create({
                        data: {
                            userId: userId || null,
                            binId: binId,
                            reason: message,
                            priority: priority,
                            status: 'PENDING',
                            aiGenerated: true,
                            metadata: metadata
                        },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            },
                            bin: {
                                select: {
                                    id: true,
                                    location: true,
                                    fullness: true
                                }
                            }
                        }
                    });
                    break;

                case 'report':
                    // Create a new report thread based on AI message
                    result = await prisma.reportThread.create({
                        data: {
                            userId: userId || null,
                            subject: `AI Generated Report - ${new Date().toLocaleDateString()}`,
                            status: 'OPEN',
                            aiGenerated: true,
                            metadata: metadata
                        }
                    });

                    // Add the AI message as the first message in the thread
                    await prisma.reportMessage.create({
                        data: {
                            threadId: result.id,
                            content: message,
                            sender: 'AI',
                            aiGenerated: true
                        }
                    });

                    result = await prisma.reportThread.findUnique({
                        where: { id: result.id },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            },
                            messages: true
                        }
                    });
                    break;

                case 'chat_message':
                    // Store AI message in chat history
                    result = await prisma.chatMessage.create({
                        data: {
                            content: message,
                            sender: 'AI',
                            userId: userId || null,
                            aiGenerated: true,
                            metadata: metadata
                        }
                    });
                    break;

                case 'bin_update':
                    // Update bin information based on AI message
                    if (!binId) {
                        return res.status(400).json({
                            success: false,
                            error: 'Bin ID is required for bin updates'
                        });
                    }

                    // Extract fullness percentage from message if provided
                    const fullnessMatch = message.match(/(\d+)%/);
                    const fullness = fullnessMatch ? parseInt(fullnessMatch[1]) : null;

                    const updateData = {
                        aiGenerated: true,
                        metadata: metadata
                    };

                    if (fullness !== null) {
                        updateData.fullness = fullness;
                    }

                    result = await prisma.bin.update({
                        where: { id: binId },
                        data: updateData,
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            }
                        }
                    });
                    break;

                default:
                    // Just log the AI message without specific action
                    result = {
                        message: 'AI message received and logged',
                        content: message,
                        timestamp: new Date().toISOString(),
                        action: 'logged_only'
                    };
            }

            res.json({
                success: true,
                data: result,
                timestamp: new Date().toISOString(),
                action: action || 'logged_only',
                message: 'AI message processed successfully'
            });

        } catch (error) {
            console.error('Webhook receiveAIMessage error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to process AI message',
                details: error.message
            });
        }
    },

    // NEW: Get AI-generated content
    getAIGeneratedContent: async (req, res) => {
        try {
            const { type, limit = 50 } = req.query;
            const dateLimit = new Date();
            dateLimit.setDate(dateLimit.getDate() - 7); // Last 7 days

            let result = {};

            switch (type) {
                case 'collection_requests':
                    result = await prisma.collectionRequest.findMany({
                        where: {
                            aiGenerated: true,
                            createdAt: {
                                gte: dateLimit
                            }
                        },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            },
                            bin: {
                                select: {
                                    id: true,
                                    location: true,
                                    fullness: true
                                }
                            }
                        },
                        orderBy: {
                            createdAt: 'desc'
                        },
                        take: parseInt(limit)
                    });
                    break;

                case 'reports':
                    result = await prisma.reportThread.findMany({
                        where: {
                            aiGenerated: true,
                            createdAt: {
                                gte: dateLimit
                            }
                        },
                        include: {
                            user: {
                                select: {
                                    id: true,
                                    name: true,
                                    email: true
                                }
                            },
                            messages: {
                                where: {
                                    aiGenerated: true
                                }
                            }
                        },
                        orderBy: {
                            createdAt: 'desc'
                        },
                        take: parseInt(limit)
                    });
                    break;

                case 'chat_messages':
                    result = await prisma.chatMessage.findMany({
                        where: {
                            aiGenerated: true,
                            createdAt: {
                                gte: dateLimit
                            }
                        },
                        orderBy: {
                            createdAt: 'desc'
                        },
                        take: parseInt(limit)
                    });
                    break;

                default:
                    // Get all AI-generated content
                    const [requests, reports, messages] = await Promise.all([
                        prisma.collectionRequest.count({
                            where: {
                                aiGenerated: true,
                                createdAt: { gte: dateLimit }
                            }
                        }),
                        prisma.reportThread.count({
                            where: {
                                aiGenerated: true,
                                createdAt: { gte: dateLimit }
                            }
                        }),
                        prisma.chatMessage.count({
                            where: {
                                aiGenerated: true,
                                createdAt: { gte: dateLimit }
                            }
                        })
                    ]);

                    result = {
                        collectionRequests: requests,
                        reports: reports,
                        chatMessages: messages,
                        period: '7 days'
                    };
            }

            res.json({
                success: true,
                data: result,
                timestamp: new Date().toISOString(),
                type: type || 'summary',
                count: Array.isArray(result) ? result.length : null
            });

        } catch (error) {
            console.error('Webhook getAIGeneratedContent error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch AI-generated content'
            });
        }
    }
};

module.exports = webhookController; 