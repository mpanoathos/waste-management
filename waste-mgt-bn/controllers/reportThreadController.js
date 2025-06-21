const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// User creates a new report thread
exports.createThread = async (req, res) => {
  const { subject, message } = req.body;
  const userId = req.user.id;
  if (!subject || !message) {
    return res.status(400).json({ message: 'Subject and message are required.' });
  }
  try {
    const thread = await prisma.reportThread.create({
      data: {
        userId,
        subject,
        messages: {
          create: [{
            senderId: userId,
            senderRole: 'USER',
            content: message
          }]
        }
      },
      include: { messages: true }
    });
    res.status(201).json({ message: 'Thread created.', thread });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create thread', error });
  }
};

// Admin: get all threads
exports.getThreads = async (req, res) => {
  try {
    const threads = await prisma.reportThread.findMany({
      include: {
        user: { select: { id: true, name: true, email: true } },
        messages: true
      },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ threads });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch threads', error });
  }
};

// User: get their own threads
exports.getUserThreads = async (req, res) => {
  try {
    const userId = req.user.id;
    const threads = await prisma.reportThread.findMany({
      where: { userId },
      include: { messages: true },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ threads });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch threads', error });
  }
};

// Get messages for a thread
exports.getMessages = async (req, res) => {
  try {
    const { id } = req.params;
    const messages = await prisma.reportMessage.findMany({
      where: { threadId: Number(id) },
      orderBy: { createdAt: 'asc' }
    });
    res.json({ messages });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch messages', error });
  }
};

// Add a message to a thread (user or admin)
exports.addMessage = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const senderId = req.user.id;
  const senderRole = req.user.role;
  if (!content) {
    return res.status(400).json({ message: 'Message content is required.' });
  }
  try {
    const message = await prisma.reportMessage.create({
      data: {
        threadId: Number(id),
        senderId,
        senderRole,
        content
      }
    });
    res.status(201).json({ message: 'Message sent.', messageObj: message });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send message', error });
  }
}; 