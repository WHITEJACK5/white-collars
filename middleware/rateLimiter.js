// Rate limiter — in-memory with lazy expiry.
// WARNING: On Vercel serverless, each instance has its own memory, so this is best-effort per-instance.
// For production at scale, replace with a shared store (Upstash Redis, Vercel KV, or MongoDB).
// Example Upstash integration is sketched in comments below.

const rateLimitMap = new Map();

exports.rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Too many requests, please try again later',
    keyGenerator = (req) => req.ip,
    // If you configure Upstash, pass a `store` with async get/set — see below
    store = null,
  } = options;

  if (process.env.NODE_ENV === 'production' && !store) {
    console.warn('⚠️  Rate limiter is in-memory only — not shared across serverless instances. Configure Upstash Redis for strict limiting.');
  }

  return async (req, res, next) => {
    const key = keyGenerator(req);
    const now = Date.now();

    // External store path (Upstash example):
    // if (store) {
    //   const record = await store.get(key);
    //   if (!record || now > record.resetTime) { await store.set(key, { count:1, resetTime: now+windowMs }); return next(); }
    //   if (record.count >= max) { req.flash('error', message); return res.status(429).redirect('back'); }
    //   await store.set(key, { ...record, count: record.count+1 });
    //   return next();
    // }

    let record = rateLimitMap.get(key);
    if (!record || now > record.resetTime) {
      rateLimitMap.set(key, { count: 1, resetTime: now + windowMs });
      return next();
    }
    if (record.count >= max) {
      req.flash('error', message);
      return res.status(429).redirect('back');
    }
    record.count += 1;
    next();
  };
};

// No setInterval — lazy expiry on each request avoids leaking timers in serverless.
// If you need aggressive cleanup, call this manually or on a cron.
exports._clearExpired = () => {
  const now = Date.now();
  for (const [k, v] of rateLimitMap.entries()) if (now > v.resetTime) rateLimitMap.delete(k);
};
