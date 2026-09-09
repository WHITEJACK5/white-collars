const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Helper: password complexity (min 10 chars, number + symbol recommended — enforced in validation middleware)
function isStrongPassword(pw) {
  if (!pw || pw.length < 8) return false;
  // Phase 2 will enforce via validation.js; here we do minimal check
  return true;
}

router.get('/signin', (req, res) => {
  res.render('signin', { title: 'Sign In - WHITE COLLARS' });
});

router.post('/signin', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) {
      req.flash('error', 'Email and password are required');
      return res.redirect('/auth/signin');
    }
    // password field is select:false, must explicitly select
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !user.isActive) {
      req.flash('error', 'Invalid credentials or account deactivated');
      return res.redirect('/auth/signin');
    }

    // Single source of truth: User.comparePassword()
    const isValid = await user.comparePassword(password);
    if (!isValid) {
      req.flash('error', 'Invalid email or password');
      return res.redirect('/auth/signin');
    }

    // userType is canonical; role param maps to it for backward compat with old forms
    const requestedType = role || req.body.userType;
    if (requestedType && user.userType !== requestedType) {
      req.flash('error', 'Access denied for this account type');
      return res.redirect('/auth/signin');
    }

    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      userType: user.userType,
    };
    req.flash('success', `Welcome back, ${user.name}!`);

    if (user.userType === 'employer') return res.redirect('/employer/dashboard');
    return res.redirect('/jobs');
  } catch (error) {
    console.error('Signin error:', error);
    req.flash('error', 'An error occurred. Please try again.');
    res.redirect('/auth/signin');
  }
});

router.get('/signup', (req, res) => {
  res.render('signup', { title: 'Sign Up - WHITE COLLARS' });
});

router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;

    if (!name || !email || !password || !userType) {
      req.flash('error', 'All fields are required');
      return res.redirect('/auth/signup');
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      req.flash('error', 'Please provide a valid email address');
      return res.redirect('/auth/signup');
    }
    if (password.length < 8) {
      req.flash('error', 'Password must be at least 8 characters');
      return res.redirect('/auth/signup');
    }
    // Strong password: at least one number and one symbol/uppercase
    if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(password)) {
      req.flash('error', 'Password must contain uppercase, lowercase, and a number');
      return res.redirect('/auth/signup');
    }
    if (!['jobseeker', 'employer'].includes(userType)) {
      req.flash('error', 'Invalid account type');
      return res.redirect('/auth/signup');
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      req.flash('error', 'An account with this email already exists');
      return res.redirect('/auth/signup');
    }

    // Do NOT hash manually — User pre-save hook hashes exactly once
    const crypto = require('crypto');
    const verifyToken = crypto.randomBytes(32).toString('hex');
    const newUser = new User({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      userType,
      emailVerifyToken: crypto.createHash('sha256').update(verifyToken).digest('hex'),
      emailVerifyExpires: Date.now() + 1000 * 60 * 60 * 24, // 24h
    });
    await newUser.save();
    const verifyUrl = `${req.protocol}://${req.get('host')}/auth/verify-email/${verifyToken}`;
    console.log(`[EMAIL VERIFY] For ${newUser.email}: ${verifyUrl}`);
    req.flash('success', 'Account created! Please verify your email (link logged to server in dev).');
    res.redirect('/auth/signin');
  } catch (error) {
    console.error('Signup error:', error);
    if (error.code === 11000) {
      req.flash('error', 'An account with this email already exists');
      return res.redirect('/auth/signup');
    }
    req.flash('error', 'Unable to create account. Please try again.');
    res.redirect('/auth/signup');
  }
});

router.get('/forgot-password', (req, res) => {
  res.render('forgot-password', { title: 'Forgot Password - WHITE COLLARS' });
});

router.post('/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) { req.flash('error', 'Email is required'); return res.redirect('/auth/forgot-password'); }
    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Do not reveal whether email exists — prevent enumeration
      req.flash('success', 'If an account exists, a reset link has been sent');
      return res.redirect('/auth/signin');
    }
    const crypto = require('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
    user.passwordResetExpires = Date.now() + 1000 * 60 * 60; // 1h
    await user.save({ validateBeforeSave: false });
    const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password/${token}`;
    console.log(`[PASSWORD RESET] For ${user.email}: ${resetUrl} (expires in 1h)`);
    // TODO: send email via SMTP when configured
    req.flash('success', 'If an account exists, a reset link has been sent (check server logs in dev)');
    res.redirect('/auth/signin');
  } catch (e) {
    console.error('forgot-password error:', e);
    req.flash('error', 'Unable to process request');
    res.redirect('/auth/forgot-password');
  }
});

router.get('/reset-password/:token', async (req, res) => {
  try {
    const crypto = require('crypto');
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ passwordResetToken: hashed, passwordResetExpires: { $gt: Date.now() } });
    if (!user) { req.flash('error', 'Token is invalid or expired'); return res.redirect('/auth/forgot-password'); }
    res.render('reset-password', { title: 'Reset Password - WHITE COLLARS', token: req.params.token });
  } catch (e) {
    console.error('reset-password GET error:', e);
    req.flash('error', 'Invalid token');
    res.redirect('/auth/forgot-password');
  }
});

router.post('/reset-password/:token', async (req, res) => {
  try {
    const crypto = require('crypto');
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ passwordResetToken: hashed, passwordResetExpires: { $gt: Date.now() } }).select('+password');
    if (!user) { req.flash('error', 'Token is invalid or expired'); return res.redirect('/auth/forgot-password'); }
    const { password, confirmPassword } = req.body;
    if (!password || password.length < 8) { req.flash('error', 'Password must be at least 8 characters'); return res.redirect('back'); }
    if (password !== confirmPassword) { req.flash('error', 'Passwords do not match'); return res.redirect('back'); }
    if (!/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/.test(password)) { req.flash('error', 'Password must contain uppercase, lowercase, and a number'); return res.redirect('back'); }
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    req.flash('success', 'Password has been reset. Please sign in.');
    res.redirect('/auth/signin');
  } catch (e) {
    console.error('reset-password POST error:', e);
    req.flash('error', 'Unable to reset password');
    res.redirect('/auth/forgot-password');
  }
});

router.get('/verify-email/:token', async (req, res) => {
  try {
    const crypto = require('crypto');
    const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({ emailVerifyToken: hashed, emailVerifyExpires: { $gt: Date.now() } });
    if (!user) { req.flash('error', 'Verification link is invalid or expired'); return res.redirect('/auth/signin'); }
    user.emailVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyExpires = undefined;
    await user.save({ validateBeforeSave: false });
    req.flash('success', 'Email verified successfully! Please sign in.');
    res.redirect('/auth/signin');
  } catch (e) {
    console.error('verify-email error:', e);
    req.flash('error', 'Verification failed');
    res.redirect('/auth/signin');
  }
});

router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Logout error:', err);
    res.clearCookie('wc.sid');
    res.redirect('/auth/signin');
  });
});

module.exports = router;
