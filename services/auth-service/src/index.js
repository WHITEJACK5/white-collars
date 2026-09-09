require('dotenv').config();
const express = require('express');
const { db } = require('@white-collars/shared-sdk');
const handlers = require('./handlers/auth');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'auth-service' }));
app.post('/auth/signin', handlers.signin);
app.post('/auth/signup', handlers.signup);
app.post('/auth/forgot-password', handlers.forgotPassword);
app.post('/auth/reset-password/:token', handlers.resetPassword);
app.get('/auth/verify-email/:token', handlers.verifyEmail);

const PORT = process.env.AUTH_SERVICE_PORT || 3002;
if (require.main === module) {
  db.connectDB().then(() => app.listen(PORT, () => console.log(`auth-service on ${PORT}`)));
}
module.exports = app;
