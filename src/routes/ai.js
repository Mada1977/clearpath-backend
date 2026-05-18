const { Router } = require('express');
const { body, param, validationResult } = require('express-validator');
const rateLimit = require('express-rate-limit');
const { authenticate } = require('../middleware/auth');
const { getSosSteps, VALID_ADDICTIONS } = require('../utils/sos');
const ctrl = require('../controllers/ai');

const router = Router();
router.use(authenticate);

// Stricter rate limit for AI endpoint
const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  message: { error: 'Too many AI requests — please wait a moment.' },
});

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

router.post('/chat',
  aiRateLimit,
  body('message').notEmpty().isLength({ max: 2000 }),
  body('history').optional().isArray({ max: 20 }),
  validate,
  ctrl.chat
);

router.get('/messages', ctrl.getMessages);
router.get('/usage',    ctrl.getUsage);

router.get('/sos/:addiction',
  param('addiction').isIn(VALID_ADDICTIONS),
  validate,
  (req, res) => {
    const steps = getSosSteps(req.params.addiction, req.user.locale);
    res.json({ addiction: req.params.addiction, steps });
  }
);

module.exports = router;
