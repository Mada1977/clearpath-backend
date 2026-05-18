// ─── routes/health.js ────────────────────────────────────────
const { Router } = require('express');
const { getPrisma } = require('../models/prisma');
const { SUPPORTED_LANGS, getLocaleInfo } = require('../utils/i18n');
const router = Router();

router.get('/', async (req, res) => {
  try {
    await getPrisma().$queryRaw`SELECT 1`;
    res.json({ status: 'ok', service: 'ClearPath API', timestamp: new Date().toISOString() });
  } catch {
    res.status(503).json({ status: 'degraded', db: 'unreachable' });
  }
});

router.get('/locales', (req, res) => {
  const locales = SUPPORTED_LANGS.map(lang => ({
    lang,
    ...getLocaleInfo(lang),
  }));
  res.json({ locales });
});

module.exports = router;
