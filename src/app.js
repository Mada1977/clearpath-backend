const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const logger = require('./utils/logger');

const authRoutes     = require('./routes/auth');
const userRoutes     = require('./routes/users');
const logRoutes      = require('./routes/logs');
const aiRoutes       = require('./routes/ai');
const healthRoutes   = require('./routes/health');
const trackerRoutes   = require('./routes/trackers');
const supporterRoutes = require('./routes/supporters');

const app = express();

// ─── Security middleware ────────────────────────────────────
app.use(helmet());

const STATIC_ORIGINS = [
  'http://localhost:8081',
  'http://localhost:8082',
  'http://localhost:8083',
];

const ORIGIN_PATTERNS = [
  /^https:\/\/[^.]+\.onrender\.com$/,
  /^https:\/\/[^.]+\.exp\.direct$/,
];

const envOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (STATIC_ORIGINS.includes(origin)) return true;
  if (envOrigins.includes(origin)) return true;
  return ORIGIN_PATTERNS.some(re => re.test(origin));
}

const corsOptions = {
  origin: (origin, cb) => {
    if (isAllowedOrigin(origin)) return cb(null, true);
    cb(new Error(`CORS blocked: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Handle OPTIONS preflight for all routes
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

// ─── General middleware ─────────────────────────────────────
app.use(compression());
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(morgan('combined', {
  stream: { write: (msg) => logger.http(msg.trim()) },
}));

// ─── Global rate limiting ───────────────────────────────────
app.use(rateLimit({
  windowMs: 60 * 1000,   // 1 minute
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests — please slow down.' },
}));

// ─── Routes ─────────────────────────────────────────────────
app.use('/v1/health',    healthRoutes);
app.use('/v1/auth',      authRoutes);
app.use('/v1/users',     userRoutes);
app.use('/v1/logs',      logRoutes);
app.use('/v1/ai',        aiRoutes);
app.use('/v1/trackers',   trackerRoutes);
app.use('/v1/supporters', supporterRoutes);

// ─── 404 handler ────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Global error handler ───────────────────────────────────
app.use((err, req, res, next) => {
  logger.error(`${err.status || 500} — ${err.message}`, { stack: err.stack });
  const status = err.status || 500;
  const message = status < 500 ? err.message : 'Internal server error';
  res.status(status).json({ error: message });
});

module.exports = app;
