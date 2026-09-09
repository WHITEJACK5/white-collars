require('dotenv').config();
const express = require('express');
const { db } = require('@white-collars/shared-sdk');
const handlers = require('./handlers/applications');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'applications-service' }));
app.post('/applications', handlers.create);
app.get('/applications', handlers.list);
app.get('/applications/:id', handlers.getById);
app.patch('/applications/:id/status', handlers.updateStatus);
app.post('/applications/:id/video', handlers.uploadVideo);

const PORT = process.env.APPLICATIONS_SERVICE_PORT || 3004;
if (require.main === module) {
  db.connectDB().then(() => app.listen(PORT, () => console.log(`applications-service on ${PORT}`)));
}
module.exports = app;
