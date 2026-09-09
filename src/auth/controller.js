const authService = require('./service');

exports.getSignIn = (req, res) => res.render('signin', { title: 'Sign In - WHITE COLLARS' });
exports.getSignUp = (req, res) => res.render('signup', { title: 'Sign Up - WHITE COLLARS' });
exports.getForgotPassword = (req, res) => res.render('forgot-password', { title: 'Forgot Password - WHITE COLLARS' });

exports.postSignIn = async (req, res) => {
  try {
    const { email, password, role, userType } = req.body;
    const requestedType = role || userType;
    const user = await authService.authenticate(email, password);
    if (!user) {
      req.flash('error', 'Invalid credentials or account deactivated');
      return res.redirect('/auth/signin');
    }
    if (requestedType && user.userType !== requestedType) {
      req.flash('error', 'Access denied for this account type');
      return res.redirect('/auth/signin');
    }
    req.session.user = { id: user._id, name: user.name, email: user.email, userType: user.userType };
    req.flash('success', `Welcome back, ${user.name}!`);
    return res.redirect(user.userType === 'employer' ? '/employer/dashboard' : '/jobs');
  } catch (e) {
    console.error('postSignIn error:', e);
    req.flash('error', 'An error occurred. Please try again.');
    return res.redirect('/auth/signin');
  }
};

exports.postSignUp = async (req, res) => {
  try {
    const { name, email, password, userType } = req.body;
    if (!name || !email || !password || !userType) {
      req.flash('error', 'All fields are required');
      return res.redirect('/auth/signup');
    }
    const { user, verifyToken } = await authService.register({ name, email, password, userType });
    const verifyUrl = `${req.protocol}://${req.get('host')}/auth/verify-email/${verifyToken}`;
    console.log(`[EMAIL VERIFY] For ${user.email}: ${verifyUrl}`);
    req.flash('success', 'Account created! Please verify your email (link logged to server in dev).');
    return res.redirect('/auth/signin');
  } catch (e) {
    console.error('postSignUp error:', e);
    if (e.code === 11000) req.flash('error', 'An account with this email already exists');
    else req.flash('error', e.message || 'Signup failed');
    return res.redirect('/auth/signup');
  }
};

exports.postForgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const result = await authService.generatePasswordReset(email);
    if (result) {
      const resetUrl = `${req.protocol}://${req.get('host')}/auth/reset-password/${result.token}`;
      console.log(`[PASSWORD RESET] For ${result.user.email}: ${resetUrl}`);
    }
    req.flash('success', 'If an account exists, a reset link has been sent');
    return res.redirect('/auth/signin');
  } catch (e) {
    console.error('forgot-password error:', e);
    req.flash('error', 'Unable to process request');
    return res.redirect('/auth/forgot-password');
  }
};

exports.getResetPassword = async (req, res) => {
  const usersService = require('../users/service');
  const crypto = require('crypto');
  const hashed = crypto.createHash('sha256').update(req.params.token).digest('hex');
  const user = await usersService._model.findOne({ passwordResetToken: hashed, passwordResetExpires: { $gt: Date.now() } });
  if (!user) { req.flash('error', 'Token is invalid or expired'); return res.redirect('/auth/forgot-password'); }
  res.render('reset-password', { title: 'Reset Password - WHITE COLLARS', token: req.params.token });
};

exports.postResetPassword = async (req, res) => {
  try {
    const { password, confirmPassword } = req.body;
    if (!password || password.length < 8) { req.flash('error', 'Password must be at least 8 characters'); return res.redirect('back'); }
    if (password !== confirmPassword) { req.flash('error', 'Passwords do not match'); return res.redirect('back'); }
    const user = await authService.resetPassword(req.params.token, password);
    if (!user) { req.flash('error', 'Token is invalid or expired'); return res.redirect('/auth/forgot-password'); }
    req.flash('success', 'Password has been reset. Please sign in.');
    return res.redirect('/auth/signin');
  } catch (e) {
    console.error('reset-password error:', e);
    req.flash('error', 'Unable to reset password');
    return res.redirect('/auth/forgot-password');
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const user = await authService.verifyEmail(req.params.token);
    if (!user) { req.flash('error', 'Verification link is invalid or expired'); return res.redirect('/auth/signin'); }
    req.flash('success', 'Email verified successfully! Please sign in.');
    return res.redirect('/auth/signin');
  } catch (e) {
    console.error('verify-email error:', e);
    req.flash('error', 'Verification failed');
    return res.redirect('/auth/signin');
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.clearCookie('wc.sid');
    res.redirect('/auth/signin');
  });
};
