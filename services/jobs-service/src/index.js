require('dotenv').config();
const express = require('express');
const { db } = require('@white-collars/shared-sdk');
const jobHandlers = require('./handlers/jobs');
const companyHandlers = require('./handlers/companies');

const app = express();
app.use(express.json());

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'jobs-service' }));
app.get('/jobs', jobHandlers.list);
app.post('/jobs', jobHandlers.create);
app.get('/jobs/:id', jobHandlers.getById);
app.put('/jobs/:id', jobHandlers.update);
app.delete('/jobs/:id', jobHandlers.remove);
app.get('/companies', companyHandlers.list);
app.get('/companies/:slug', companyHandlers.getBySlug);

const PORT = process.env.JOBS_SERVICE_PORT || 3003;
if (require.main === module) {
  db.connectDB().then(() => app.listen(PORT, () => console.log(`jobs-service on ${PORT}`)));
}
module.exports = app;
