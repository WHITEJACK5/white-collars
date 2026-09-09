// 404 Not Found Handler
exports.notFound = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

// Global Error Handler
exports.errorHandler = (err, req, res, next) => {
  const statusCode = err.status || err.statusCode || 500;
  const message = err.message || 'Internal Server Error';
  
  // Log error for debugging
  console.error('Error:', {
    message: err.message,
    stack: err.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip
  });
  
  // Mongoose validation error
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    req.flash('error', errors.join(', '));
    return res.redirect('back');
  }
  
  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    req.flash('error', `${field} already exists`);
    return res.redirect('back');
  }
  
  // Mongoose cast error (invalid ObjectId)
  if (err.name === 'CastError') {
    req.flash('error', 'Resource not found');
    return res.redirect('/');
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    req.flash('error', 'Invalid token. Please sign in again.');
    return res.redirect('/auth/signin');
  }
  
  if (err.name === 'TokenExpiredError') {
    req.flash('error', 'Session expired. Please sign in again.');
    return res.redirect('/auth/signin');
  }
  
  // Development vs Production error response
  if (process.env.NODE_ENV === 'development') {
    res.status(statusCode).render('error', {
      title: 'Error',
      message,
      error: err,
      stack: err.stack
    });
  } else {
    // Production - don't leak error details
    res.status(statusCode).render('error', {
      title: 'Error',
      message: statusCode === 500 ? 'Something went wrong' : message,
      error: {},
      stack: null
    });
  }
};

// Async error wrapper
exports.catchAsync = (fn) => {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};
