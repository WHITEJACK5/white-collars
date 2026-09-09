const User = require('../models/User');

// NOTE: Canonical auth logic lives in routes/auth.js via User.comparePassword().
// This controller is kept for backwards compat; new code should call routes/auth.js
// or extract shared service. Kept thin and consistent with User schema (userType, not role).

exports.getSignIn = (req, res) => {
  res.render('signin', { title: 'Sign In - WHITE COLLARS' });
};

exports.postSignIn = async (req, res) => {
  try {
    const { email, password, role, userType } = req.body;
    const requestedType = role || userType;
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user || !user.isActive) {
      req.flash('error', 'Invalid credentials');
      return res.redirect('/auth/signin');
    }
    const valid = await user.comparePassword(password);
    if (!valid) {
      req.flash('error', 'Invalid credentials');
      return res.redirect('/auth/signin');
    }
    if (requestedType && user.userType !== requestedType) {
      req.flash('error', 'Access denied for this account type');
      return res.redirect('/auth/signin');
    }
    req.session.user = { id: user._id, name: user.name, email: user.email, userType: user.userType };
    req.flash('success', `Welcome back, ${user.name}!`);
    return res.redirect(user.userType === 'employer' ? '/employer/dashboard' : '/jobs');
  } catch (error) {
    console.error('postSignIn error:', error);
    req.flash('error', error.message || 'Sign-in failed');
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
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      req.flash('error', 'User already exists');
      return res.redirect('/auth/signup');
    }
    // Let User pre-save hook hash
    const user = await User.create({ name: name.trim(), email: email.toLowerCase().trim(), password, userType });
    req.session.user = { id: user._id, name: user.name, email: user.email, userType: user.userType };
    req.flash('success', 'Account created');
    return res.redirect('/');
  } catch (error) {
    console.error('postSignUp error:', error);
    req.flash('error', error.message || 'Signup failed');
    return res.redirect('/auth/signup');
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error(err);
    res.clearCookie('wc.sid');
    res.redirect('/');
  });
};
