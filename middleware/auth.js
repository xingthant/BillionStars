const jwt = require('jsonwebtoken');
const User = require('../models/User');

const requireAuth = async (req, res, next) => {
  const token = req.cookies?.token;
  
  // Add debug logging
  console.log('Auth middleware - Cookies:', req.cookies);
  console.log('Auth middleware - Token present:', !!token);
  
  if (!token) {
    console.log('Auth middleware - No token found');
    return res.status(401).json({ message: 'Authentication required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log('Auth middleware - Token decoded:', decoded);
    
    const user = await User.findById(decoded.userId).select('-password');
    if (!user) {
      console.log('Auth middleware - User not found for ID:', decoded.userId);
      return res.status(401).json({ message: 'User not found' });
    }
    
    console.log('Auth middleware - User authenticated:', user._id);
    req.user = user;
    next();
  } catch (error) {
    console.log('Auth middleware - Token verification failed:', error.message);
    return res.status(401).json({ message: 'Invalid token' });
  }
};

const requireAdmin = async (req, res, next) => {
  // First check authentication
  requireAuth(req, res, (err) => {
    if (err) {
      return next(err);
    }
    
    // Then check if user is admin
    if (req.user && req.user.isAdmin) {
      console.log('Admin access granted for user:', req.user._id);
      next();
    } else {
      console.log('Admin access denied for user:', req.user?._id);
      res.status(403).json({ message: 'Admin access required' });
    }
  });
};

module.exports = { requireAuth, requireAdmin };
