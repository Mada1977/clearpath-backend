// ─── routes/users.js ─────────────────────────────────────────
const { Router } = require('express');
const { body } = require('express-validator');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/users');

const router = Router();
router.use(authenticate);

router.get('/',                  ctrl.getMe);      // alias
router.get('/me',                ctrl.getMe);
router.patch('/me',              ctrl.updateMe);
router.delete('/me',             ctrl.deleteMe);
router.post('/me/verify-age',    ctrl.verifyAge);
router.get('/me/stats',            ctrl.getStats);
router.get('/me/stability-score', ctrl.getStabilityScore);
router.get('/me/export',          ctrl.exportData);

module.exports = router;
