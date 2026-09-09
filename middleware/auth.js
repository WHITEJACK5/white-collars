const User = require('../models/User');

exports.isAuthenticated = (req, res, next) => {
  if (req.session && req.session.user) return next();
  req.session.returnTo = req.originalUrl;
  req.flash('error', 'Please sign in to access this page');
  return res.redirect('/auth/signin');
};

exports.isGuest = (req, res, next) => {
  if (!req.session.user) return next();
  return res.redirect('/');
};

// hasRole now checks userType — canonical field is userType (jobseeker/employer)
exports.hasRole = (...roles) => {
  return (req, res, next) => {
    if (!req.session.user) {
      req.flash('error', 'Please sign in to access this page');
      return res.redirect('/auth/signin');
    }
    const type = req.session.user.userType;
    if (!roles.includes(type)) {
      req.flash('error', 'You do not have permission to access this page');
      return res.redirect('/');
    }
    next();
  };
};

exports.isAdmin = async (req, res, next) => {
  if (!req.session.user) {
    req.flash('error', 'Please sign in');
    return res.redirect('/auth/signin');
  }
  // Admin check: look up fresh user to allow role change without re-login
  try {
    const user = await User.findById(req.session.user.id).select('userType');
    if (!user || user.userType !== 'employer') {
      // No explicit admin userType; treat employer with flag or allow admin via env allowlist
      // If you add an 'admin' userType later, change this check to user.userType !== 'admin'
      req.flash('error', 'Admin access required');
      return res.redirect('/');
    }
    // For now, allow any employer to manage jobs; tighten when admin role is introduced
    return next();
  } catch (e) {
    console.error('isAdmin check failed:', e);
    return res.redirect('/auth/signin');
  }
};

exports.isEmployer = (req, res, next) => {
  if (!req.session.user) {
    req.flash('error', 'Please sign in');
    return res.redirect('/auth/signin');
  }
  if (!['employer'].includes(req.session.user.userType)) {
    req.flash('error', 'Employer access required');
    return res.redirect('/');
  }
  next();
};

exports.attachUser = async (req, res, next) => {
  const id = req.session?.user?.id;
  if (id) {
    try {
      const user = await User.findById(id).select('-password');
      if (user) {
        req.user = user;
        res.locals.user = user;
      }
    } catch (e) {
      console.error('attachUser failed:', e);
    }
  }
  next();
};

exports.verifySession = async (req, res, next) => {
  const id = req.session?.user?.id;
  if (id) {
    try {
      const user = await User.findById(id).select('isActive');
      if (!user || !user.isActive) {
        req.session.destroy(() => {});
        req.flash('error', 'Session expired. Please sign in again.');
        return res.redirect('/auth/signin');
      }
    } catch (e) {
      console.error('verifySession failed:', e);
    }
  }
  next();
};
