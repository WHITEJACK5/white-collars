// apps/web — EJS frontend, Stage 3: still server-rendered, but data comes via gateway/clients, not direct DB
// For solo portfolio, this reuses src/pages + src/jobs clients; in real split it would fetch http://jobs-service:3003/jobs

require('dotenv').config();
const express = require('express');
const path = require('path');

const app = express();
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../../../views')); // views stay at repo root for now
app.use(express.static(path.join(__dirname, '../../../public')));

app.get('/health', (req, res) => res.json({ status: 'ok', service: 'web' }));
app.get('/', (req, res) => res.render('home', { title: 'WHITE COLLARS', jobs: [], stats: {} }));

const PORT = process.env.WEB_PORT || 3000;
if (require.main === module) app.listen(PORT, () => console.log(`web on ${PORT}`));
module.exports = app;
