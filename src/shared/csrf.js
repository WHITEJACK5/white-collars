const crypto = require('crypto');

// Double-submit cookie pattern — stateless, works on Vercel serverless (no session store needed beyond cookie).
// Cookie holds the token; form sends same token in _csrf field or X-CSRF-Token header. Server compares.

const COOKIE_NAME = '_csrf';
const FIELD_NAME = '_csrf';

function generateToken() {
  return crypto.randomBytes(32).toString('hex');
}

exports.csrfProtection = (req, res, next) => {
  // Ensure cookie token exists for GET / HEAD / OPTIONS — also expose via res.locals for templates
  let token = req.cookies && req.cookies[COOKIE_NAME];
  if (!token) {
    token = generateToken();
    res.cookie(COOKIE_NAME, token, {
      httpOnly: false, // must be readable by JS if needed, but we set SameSite
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 1000 * 60 * 60 * 24, // 24h
    });
  }
  // expose helper for templates: req.csrfToken()
  req.csrfToken = () => token;
  res.locals.csrfToken = token;

  // Validate on mutating methods
  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
    const submitted = (req.body && req.body[FIELD_NAME]) || req.headers['x-csrf-token'] || req.headers['x-xsrf-token'];
    if (!submitted || submitted !== token) {
      const err = new Error('Invalid CSRF token');
      err.status = 403;
      return next(err);
    }
  }
  next();
};

// Convenience: view helper to emit hidden input
// In EJS: <%- csrfInput() %> where csrfInput is exposed via res.locals
exports.csrfInput = (token) => `<input type="hidden" name="${FIELD_NAME}" value="${token}">`;
