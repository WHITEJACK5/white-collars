// ========================================
// Flash Messages Middleware
// ========================================

// Main flash middleware
exports.flash = (req, res, next) => {
  // Initialize session flash if it doesn't exist
  if (!req.session) {
    console.error('Session is not initialized. Make sure express-session is configured before flash middleware.');
    return next();
  }

  // Initialize flash storage
  if (!req.session.flash) {
    req.session.flash = {};
  }

  // Add flash method to request object
  req.flash = function(type, message) {
    // Validate inputs
    if (!type || !message) {
      console.warn('Flash message requires both type and message');
      return;
    }

    // Initialize array for this message type if it doesn't exist
    if (!this.session.flash[type]) {
      this.session.flash[type] = [];
    }

    // Add message to the array
    this.session.flash[type].push(message);
    
    // Return the messages for chaining
    return this.session.flash[type];
  };

  // Make flash messages available in templates
  res.locals.messages = { ...req.session.flash };
  
  // Also make individual message types available
  res.locals.success = req.session.flash?.success?.[0] || null;
  res.locals.error = req.session.flash?.error?.[0] || null;
  res.locals.warning = req.session.flash?.warning?.[0] || null;
  res.locals.info = req.session.flash?.info?.[0] || null;

  // Clear flash messages after they've been set in locals
  req.session.flash = {};

  next();
};

// Helper: Get all flash messages
exports.getFlashMessages = (req) => {
  if (!req.session || !req.session.flash) {
    return {};
  }
  
  const messages = { ...req.session.flash };
  req.session.flash = {};
  return messages;
};

// Helper: Get flash messages of a specific type
exports.getFlashByType = (req, type) => {
  if (!req.session || !req.session.flash || !req.session.flash[type]) {
    return [];
  }
  
  const messages = [...req.session.flash[type]];
  delete req.session.flash[type];
  return messages;
};

// Helper: Check if flash messages exist
exports.hasFlash = (req, type = null) => {
  if (!req.session || !req.session.flash) {
    return false;
  }
  
  if (type) {
    return Array.isArray(req.session.flash[type]) && req.session.flash[type].length > 0;
  }
  
  return Object.keys(req.session.flash).some(key => 
    Array.isArray(req.session.flash[key]) && req.session.flash[key].length > 0
  );
};

// Helper: Clear all flash messages
exports.clearFlash = (req) => {
  if (req.session) {
    req.session.flash = {};
  }
};

// Helper: Set flash message (alternative to req.flash)
exports.setFlash = (req, type, message) => {
  if (!req.session) {
    console.error('Session not initialized');
    return false;
  }
  
  if (!req.session.flash) {
    req.session.flash = {};
  }
  
  if (!req.session.flash[type]) {
    req.session.flash[type] = [];
  }
  
  req.session.flash[type].push(message);
  return true;
};

// Convenience methods for common flash types
exports.flashSuccess = (req, message) => {
  return exports.setFlash(req, 'success', message);
};

exports.flashError = (req, message) => {
  return exports.setFlash(req, 'error', message);
};

exports.flashWarning = (req, message) => {
  return exports.setFlash(req, 'warning', message);
};

exports.flashInfo = (req, message) => {
  return exports.setFlash(req, 'info', message);
};

// Express middleware to handle flash in routes
exports.flashMiddleware = (req, res, next) => {
  // Add convenience methods to response object
  res.flash = {
    success: (message) => exports.flashSuccess(req, message),
    error: (message) => exports.flashError(req, message),
    warning: (message) => exports.flashWarning(req, message),
    info: (message) => exports.flashInfo(req, message)
  };
  
  next();
};
