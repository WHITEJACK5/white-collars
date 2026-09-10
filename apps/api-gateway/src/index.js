require('dotenv').config();
const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Single entry point — frontend calls gateway, gateway forwards to right service
const targets = {
  '/api/users': process.env.USERS_SERVICE_URL || 'http://users-service:3001',
  '/api/auth': process.env.AUTH_SERVICE_URL || 'http://auth-service:3002',
  '/api/jobs': process.env.JOBS_SERVICE_URL || 'http://jobs-service:3003',
  '/api/companies': process.env.JOBS_SERVICE_URL || 'http://jobs-service:3003',
  '/api/applications': process.env.APPLICATIONS_SERVICE_URL || 'http://applications-service:3004',
};

for (const [path, target] of Object.entries(targets)) {
  app.use(path, createProxyMiddleware({ target, changeOrigin: true, pathRewrite: { [`^${path}`]: path.replace('/api','') } }));
}

app.get('/health', (req, res) => res.json({ status: 'ok', gateway: true }));

const PORT = process.env.GATEWAY_PORT || 3005;
if (require.main === module) {
  app.listen(PORT, () => console.log(`api-gateway listening on ${PORT}`));
}
module.exports = app;
