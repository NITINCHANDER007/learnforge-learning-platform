const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - require valid JWT
exports.protect = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized to access this route. Please log in.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'datadrix-super-secret-jwt-key-2026-secure');
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ success: false, message: 'User not found' });
    }

    if (!user.isActive || user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: user.blockReason
          ? `Your account has been blocked: ${user.blockReason}`
          : 'Your account has been blocked by the administrator.'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({ success: false, message: 'Token is invalid or expired' });
  }
};

// Optional auth - identify user if token is provided, continue anonymously if not
exports.optionalAuth = async (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'datadrix-super-secret-jwt-key-2026-secure');
      const user = await User.findById(decoded.id);
      if (user && user.isActive && !user.isBlocked) {
        req.user = user;
      }
    } catch (e) {
      // Ignore token errors for optional auth
    }
  }

  next();
};

// Require admin role
exports.admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    return res.status(403).json({ success: false, message: 'Access denied: Admin privileges required' });
  }
};
