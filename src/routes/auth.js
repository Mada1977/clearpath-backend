const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const ctrl = require('../controllers/auth');

const router = Router();

// Validation middleware helper
function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
}

router.post('/register',
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  body('name').optional().trim().isLength({ max: 100 }),
  validate,
  ctrl.register
);

router.post('/login',
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
  validate,
  ctrl.login
);

router.post('/refresh',
  body('refreshToken').notEmpty(),
  validate,
  ctrl.refresh
);

router.post('/logout', ctrl.logout);

router.post('/forgot-password',
  body('email').isEmail().normalizeEmail(),
  validate,
  ctrl.forgotPassword
);

router.post('/reset-password',
  body('token').notEmpty(),
  body('password').isLength({ min: 8 }),
  validate,
  ctrl.resetPassword
);

router.get('/unsubscribe', ctrl.unsubscribe);

module.exports = router;
