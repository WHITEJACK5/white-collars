require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const path = require('path');
const methodOverride = require('method-override');

const requiredEnv = ['MONGODB_URI', 'SESSION_SECRET'];
const missing = requiredEnv.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  console.error('   See .env.example for the full list. Refusing to boot with insecure defaults.');
  throw new Error(`Missing required env vars: ${missing.join(', ')}`);
}
if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 32) {
  console.warn('⚠️  SESSION_SECRET is shorter than 32 chars — use a strong random string in production');
}

const security = require('./src/shared/security');
const csrf = require('./src/shared/csrf');
const flash = require('./src/shared/flash');
const connectDB = require('./src/shared/db');

const app = express();

connectDB().catch((err) => {
  console.error('❌ MongoDB initial connection failed:', err.message);
  if (process.env.NODE_ENV !== 'production') process.exit(1);
});

mongoose.connection.on('error', (err) => console.error('❌ MongoDB error:', err.message));
mongoose.connection.on('disconnected', () => console.warn('⚠️ MongoDB disconnected'));
mongoose.connection.on('reconnected', () => console.log('✅ MongoDB reconnected'));

app.set('trust proxy', 1);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());
app.use(methodOverride('_method'));
app.use(security.setSecurityHeaders);
app.use(security.sanitizeInput);

if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

app.use(
  express.static(path.join(__dirname, 'public'), {
    maxAge: process.env.NODE_ENV === 'production' ? '1y' : 0,
  })
);

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGODB_URI,
      touchAfter: 24 * 3600,
      crypto: { secret: process.env.SESSION_SECRET },
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24 * 7,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    },
    name: 'wc.sid',
  })
);
app.use(flash.flash);
app.use(csrf.csrfProtection);
app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.currentPath = req.path;
  next();
});

// ============================================
// ROUTES — feature-based (Stage 1)
// Each feature owns its routes/controller/model/service
// ============================================
try {
  const pagesRoutes = require('./src/pages/routes');
  const authRoutes = require('./src/auth/routes');
  const jobsRoutes = require('./src/jobs/routes');
  const companiesRoutes = require('./src/companies/routes');
  const employerRoutes = require('./src/jobs/employer.routes');

  app.use('/', pagesRoutes);
  app.use('/auth', authRoutes);
  app.use('/jobs', jobsRoutes);
  app.use('/companies', companiesRoutes);
  app.use('/employer', employerRoutes);

  console.log('✅ Loaded routes: /, /auth, /jobs, /companies, /employer');
} catch (error) {
  console.error('❌ Error loading routes:', error.message);
  console.error(error.stack);
  if (process.env.NODE_ENV !== 'production') process.exit(1);
}

const { notFound, errorHandler } = require('./src/shared/errors');
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log('\n═══════════════════════════════════════');
    console.log('🚀 WHITE COLLARS Server Started (src/ layout)');
    console.log('═══════════════════════════════════════');
    console.log(`📍 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Local URL:   http://localhost:${PORT}`);
    console.log('═══════════════════════════════════════\n');
  });
}

process.on('SIGTERM', async () => {
  console.log('SIGTERM received');
  try { await mongoose.connection.close(); } catch {}
  process.exit(0);
});
process.on('SIGINT', async () => {
  console.log('\nSIGINT received');
  try { await mongoose.connection.close(); } catch {}
  process.exit(0);
});

module.exports = app;
