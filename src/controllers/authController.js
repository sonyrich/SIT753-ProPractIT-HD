const jwt = require('jsonwebtoken');
const UserModel = require('../models/userModel');
const logger = require('../middleware/logger');

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const JWT_EXPIRES = process.env.JWT_EXPIRES || '24h';

const authController = {
  register: async (req, res) => {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Name, email, and password are required' });
      }
      if (password.length < 6) {
        return res.status(400).json({ error: 'Password must be at least 6 characters' });
      }
      const existing = UserModel.findByEmail(email);
      if (existing) return res.status(409).json({ error: 'Email already registered' });
      const user = await UserModel.create({ name, email, password });
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
      logger.info(`New user registered: ${user.email}`);
      res.status(201).json({ success: true, token, user });
    } catch (err) {
      logger.error('register error:', err);
      res.status(500).json({ error: 'Registration failed' });
    }
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      if (!email || !password) return res.status(400).json({ error: 'Email and password are required' });
      const user = UserModel.findByEmail(email);
      if (!user) return res.status(401).json({ error: 'Invalid credentials' });
      const valid = await UserModel.validatePassword(password, user.password);
      if (!valid) return res.status(401).json({ error: 'Invalid credentials' });
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
      const safeUser = { ...user };
      delete safeUser.password;
      logger.info(`User logged in: ${user.email}`);
      res.json({ success: true, token, user: safeUser });
    } catch (err) {
      logger.error('login error:', err);
      res.status(500).json({ error: 'Login failed' });
    }
  },

  getProfile: (req, res) => {
    const user = UserModel.findById(req.user.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const { password, ...safeUser } = user;
    res.json({ success: true, data: safeUser });
  }
};

module.exports = authController;