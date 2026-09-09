const usersService = require('../users/service');

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
  try {
    const user = await usersService.findById(req.session.user.id);
    if (!user || user.userType !== 'employer') {
      req.flash('error', 'Admin access required');
      return res.redirect('/');
    }
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
      const user = await usersService.findById(id);
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
      const user = await usersService.findById(id);
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
