const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = new PrismaClient();

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
    const userId = parseInt(req.params.id);
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