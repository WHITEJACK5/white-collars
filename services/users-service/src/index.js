require('dotenv').config();
const express = require('express');
const { db } = require('@white-collars/shared-sdk');
const handlers = require('./handlers/users');

const app = express();
app.use(express.json());

// Health
app.get('/health', (req, res) => res.json({ status: 'ok', service: 'users-service' }));

// Contract: POST /users, GET /users?email, GET /users/:id
app.post('/users', handlers.createUser);
app.get('/users', handlers.getByEmail);
app.get('/users/:id', handlers.getById);
app.patch('/users/:id', handlers.updateUser);
app.post('/users/:id/verify-password', handlers.verifyPassword);

const PORT = process.env.USERS_SERVICE_PORT || 3001;

if (require.main === module) {
  db.connectDB().then(() => {
    app.listen(PORT, () => console.log(`users-service listening on ${PORT}`));
  });
}

module.exports = app;
