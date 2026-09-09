// Vercel serverless entry — re-exports Express app for Vercel Node runtime.
// For local dev, `node server.js` starts the HTTP server (see server.js bottom).
// Health check available at /api/health via this router as well.

const app = require('../server');

// Attach lightweight health endpoint before export (does not affect other routes)
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', uptime: process.uptime(), env: process.env.NODE_ENV || 'development' });
});

module.exports = app;
