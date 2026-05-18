const { Router } = require('express');
const { body, validationResult } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/logs');

const router = Router();
router.use(authenticate);

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  next();
}

router.post('/',
  body('type').isIn(['used', 'resisted', 'craving_sos']),
  body('addiction').optional().isIn(['smoking', 'alcohol', 'drugs', 'gambling', 'pornography', 'gaming', 'social_media', 'shopping']),
  body('trigger').optional().isIn(['stress','boredom','social','emotional','habit','celebration','physical','seeing_others','unknown']),
  body('intensity').optional().isInt({ min: 1, max: 4 }),
  body('mood').optional().isIn(['rough','okay','good','great']),
  body('outcome').optional().isIn(['resisted','gave_in']),
  validate,
  ctrl.createLog
);

router.get('/',       ctrl.getLogs);
router.get('/today',  ctrl.getTodayLogs);
router.delete('/:id', ctrl.deleteLog);

module.exports = router;
