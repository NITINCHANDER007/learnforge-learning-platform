const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const {
  sendWelcomeNotification,
  sendLoginAlert,
  sendPasswordResetNotification,
  sendPasswordChangedConfirmation,
  getRecentNotifications
} = require('../services/notificationService');

// Helper to normalize phone numbers (e.g. "+91 98765-43210" -> "+919876543210")
function sanitizePhone(phone) {
  if (!phone) return null;
  const cleaned = phone.replace(/[\s\-\(\)]/g, '').trim();
  return cleaned.length > 0 ? cleaned : null;
}

// Generate JWT Token
const sendTokenResponse = (user, statusCode, res, message = null, previewUrl = null) => {
  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET || 'datadrix-super-secret-jwt-key-2026-secure',
    { expiresIn: '30d' }
  );

  res.status(statusCode).json({
    success: true,
    token,
    message,
    previewUrl,
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt
    }
  });
};

// @route   POST /api/auth/register
// @desc    Register a new student account (with Email or Mobile Number)
// @access  Public
router.post('/register', async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;

    if (!name || !password) {
      return res.status(400).json({ success: false, message: 'Please provide full name and password.' });
    }

    const cleanEmail = email ? email.toLowerCase().trim() : null;
    const cleanPhone = sanitizePhone(phone);

    if (!cleanEmail && !cleanPhone) {
      return res.status(400).json({ success: false, message: 'Please provide either an email address or mobile phone number.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
    }

    // Check existing email
    if (cleanEmail) {
      const existingEmail = await User.findOne({ email: cleanEmail });
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'An account with that email already exists.' });
      }
    }

    // Check existing phone
    if (cleanPhone) {
      const existingPhone = await User.findOne({ phone: cleanPhone });
      if (existingPhone) {
        return res.status(400).json({ success: false, message: 'An account with that mobile number already exists.' });
      }
    }

    const user = await User.create({
      name: name.trim(),
      email: cleanEmail || undefined,
      phone: cleanPhone || undefined,
      password,
      role: 'student'
    });

    // Send Welcome Notification through server (Email and/or SMS)
    let previewUrl = null;
    try {
      const dispatchResults = await sendWelcomeNotification({
        name: user.name,
        email: user.email,
        phone: user.phone
      });
      previewUrl = dispatchResults?.email?.previewUrl || null;
    } catch (err) {
      console.warn('[NOTIFICATION ERROR] Welcome dispatch:', err.message);
    }

    sendTokenResponse(
      user,
      201,
      res,
      'Account created! A welcome notification has been sent to your email/mobile.',
      previewUrl
    );
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Failed login attempt tracking
const failedLogins = new Map();
const LOCKOUT_ATTEMPTS = 5;
const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;

function isLockedOut(key) {
  const now = Date.now();
  const attempts = (failedLogins.get(key) || []).filter(t => now - t < LOCKOUT_WINDOW_MS);
  failedLogins.set(key, attempts);
  return attempts.length >= LOCKOUT_ATTEMPTS;
}

function recordFailedLogin(key) {
  const attempts = failedLogins.get(key) || [];
  attempts.push(Date.now());
  failedLogins.set(key, attempts);
}

function clearFailedLogins(key) {
  failedLogins.delete(key);
}

// @route   POST /api/auth/login
// @desc    Login user with Email OR Mobile Number & Password
// @access  Public
router.post('/login', async (req, res) => {
  try {
    const { email, identifier, password } = req.body;
    const loginInput = (identifier || email || '').trim();

    if (!loginInput || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email or mobile number, and password.' });
    }

    const cleanInput = loginInput.toLowerCase();
    const cleanPhone = sanitizePhone(loginInput);
    const clientKey = `${req.ip}:${cleanInput}`;

    if (isLockedOut(clientKey)) {
      return res.status(429).json({
        success: false,
        message: 'Too many failed login attempts. Please wait 15 minutes before trying again.'
      });
    }

    // Find user by either email or phone
    const orQuery = [{ email: cleanInput }];
    if (cleanPhone) {
      orQuery.push({ phone: cleanPhone });
    }

    const user = await User.findOne({ $or: orQuery }).select('+password');

    if (!user) {
      recordFailedLogin(clientKey);
      return res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
    }

    if (!user.isActive || user.isBlocked) {
      return res.status(403).json({
        success: false,
        message: user.blockReason
          ? `Your account has been blocked: ${user.blockReason}`
          : 'Your account has been blocked by the administrator. Please contact support.'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      recordFailedLogin(clientKey);
      return res.status(401).json({ success: false, message: 'Invalid credentials. Password incorrect.' });
    }

    clearFailedLogins(clientKey);

    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Send login alert notification through server
    sendLoginAlert({
      name: user.name,
      email: user.email,
      phone: user.phone,
      ip: req.ip || req.connection.remoteAddress,
      userAgent: req.headers['user-agent']
    }).catch(err => console.warn('[NOTIFICATION ERROR] Login alert dispatch:', err.message));

    sendTokenResponse(user, 200, res);
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/auth/forgot-password
// @desc    Generate password reset token & OTP and send via email/SMS
// @access  Public
router.post('/forgot-password', async (req, res) => {
  try {
    const { identifier } = req.body;
    if (!identifier || !identifier.trim()) {
      return res.status(400).json({ success: false, message: 'Please provide your registered email or mobile number.' });
    }

    const cleanInput = identifier.trim().toLowerCase();
    const cleanPhone = sanitizePhone(identifier);

    const orQuery = [{ email: cleanInput }];
    if (cleanPhone) {
      orQuery.push({ phone: cleanPhone });
    }

    const user = await User.findOne({ $or: orQuery });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'No account found with that email or mobile number.'
      });
    }

    // Generate secure token & 6-digit OTP
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetOtp = Math.floor(100000 + Math.random() * 900000).toString();
    const expires = Date.now() + 60 * 60 * 1000; // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordOtp = resetOtp;
    user.resetPasswordExpires = expires;
    await user.save({ validateBeforeSave: false });

    // Send Password Reset notification via server
    let previewUrl = null;
    try {
      const dispatchResults = await sendPasswordResetNotification({
        name: user.name,
        email: user.email,
        phone: user.phone,
        token: resetToken,
        otp: resetOtp
      });
      previewUrl = dispatchResults?.email?.previewUrl || null;
    } catch (err) {
      console.warn('[NOTIFICATION ERROR] Password reset dispatch:', err.message);
    }

    res.json({
      success: true,
      message: `Password reset instructions and verification code sent to ${user.email || user.phone}.`,
      token: resetToken,
      otp: resetOtp,
      previewUrl
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/auth/verify-reset-token/:token
// @desc    Verify if reset token or OTP is valid
// @access  Public
router.get('/verify-reset-token/:token', async (req, res) => {
  try {
    const { token } = req.params;
    const user = await User.findOne({
      $or: [{ resetPasswordToken: token }, { resetPasswordOtp: token }],
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Password reset link or verification code is invalid or has expired.' });
    }

    res.json({
      success: true,
      message: 'Token is valid.',
      user: {
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   POST /api/auth/reset-password
// @desc    Set new password using reset token or OTP
// @access  Public
router.post('/reset-password', async (req, res) => {
  try {
    const { token, otp, newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }

    if (!token && !otp) {
      return res.status(400).json({ success: false, message: 'Please provide a valid reset token or verification code.' });
    }

    const orConditions = [];
    if (token) orConditions.push({ resetPasswordToken: token });
    if (otp) orConditions.push({ resetPasswordOtp: otp });

    const user = await User.findOne({
      $or: orConditions,
      resetPasswordExpires: { $gt: Date.now() }
    }).select('+password');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token or verification code is invalid or has expired. Please request a new one.'
      });
    }

    // Set new password (pre-save hook will hash it)
    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordOtp = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    // Send confirmation alert
    sendPasswordChangedConfirmation({
      name: user.name,
      email: user.email,
      phone: user.phone
    }).catch(err => console.warn('[NOTIFICATION ERROR] Password changed dispatch:', err.message));

    res.json({
      success: true,
      message: 'Password reset successfully! You can now log in with your new password.'
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// @route   GET /api/auth/recent-notifications
// @desc    Get recently dispatched notifications (for dev / inspection)
// @access  Public
router.get('/recent-notifications', (req, res) => {
  res.json({
    success: true,
    notifications: getRecentNotifications()
  });
});

// @route   GET /api/auth/me
// @desc    Get currently logged in user
// @access  Private
router.get('/me', protect, async (req, res) => {
  res.status(200).json({
    success: true,
    user: {
      id: req.user._id,
      name: req.user.name,
      email: req.user.email,
      phone: req.user.phone,
      role: req.user.role,
      isActive: req.user.isActive,
      lastLogin: req.user.lastLogin,
      createdAt: req.user.createdAt
    }
  });
});

module.exports = router;
