const { Router } = require('express');
const { body, param, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/trackers');

const router = Router();
router.use(authenticate);

const VALID_CATEGORIES = [
  'smoking','alcohol','drugs','gambling',
  'pornography','gaming','social_media','shopping',
];

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

router.get('/', ctrl.list);

router.post('/',
  body('category').isIn(VALID_CATEGORIES),
  body('name').optional().isString().isLength({ max: 80 }),
  body('startDate').optional().isISO8601(),
  body('notes').optional().isString().isLength({ max: 500 }),
  validate,
  ctrl.create
);

router.patch('/:id',
  param('id').isUUID(),
  body('name').optional().isString().isLength({ max: 80 }),
  body('notes').optional().isString().isLength({ max: 500 }),
  body('startDate').optional().isISO8601(),
  body('isPaused').optional().isBoolean(),
  validate,
  ctrl.update
);

router.delete('/:id',
  param('id').isUUID(),
  validate,
  ctrl.remove
);

module.exports = router;
