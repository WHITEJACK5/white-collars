// ============================================
// Security headers + input sanitization
// ============================================

// Strict CSP without unsafe-inline — all inline styles must be moved to public/css/style.css
// If a nonce is needed in future, generate per-request and inject into templates.
const CSP_VALUE = [
  "default-src 'self'",
  "script-src 'self'",
  // style-src allows 'unsafe-inline' temporarily for style="" attributes; migrate to classes to remove
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
].join('; ');

exports.setSecurityHeaders = (req, res, next) => {
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-XSS-Protection', '0'); // modern browsers ignore; CSP is the real protection
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy', CSP_VALUE);
  // HSTS — only in production over HTTPS. Vercel terminates TLS, trust proxy handles it.
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  }
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
};

// Lightweight sanitization for string fields. NOT a substitute for parameterized queries / proper escaping.
// Applied globally before validation so validators see cleaned input.
exports.sanitizeInput = (req, res, next) => {
  const clean = (val) => {
    if (typeof val !== 'string') return val;
    return val
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      .replace(/javascript:/gi, '')
      .replace(/on\w+\s*=/gi, '');
  };

  const walk = (obj) => {
    if (!obj || typeof obj !== 'object') return;
    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'string') obj[key] = clean(obj[key]);
      else if (typeof obj[key] === 'object') walk(obj[key]);
    }
  };

  if (req.body) walk(req.body);
  if (req.query) walk(req.query);
  // do not sanitize req.params deeply — route params are controlled
  next();
};
