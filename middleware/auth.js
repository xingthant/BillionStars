const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const requireAdmin = async (req, res, next) => {
  try {
    const token = req.cookies?.token;
    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password'); 
    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }
    req.user = user;
    if (req.user.isAdmin) {
      next();
    } else {
      res.status(403).json({ message: 'Admin access required' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
};

module.exports = { requireAuth, requireAdmin };
