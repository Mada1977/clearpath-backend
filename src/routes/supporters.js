const { Router } = require('express');
const { authenticate } = require('../middleware/auth');
const ctrl = require('../controllers/supporters');

const router = Router();

// Public (code-based, no JWT)
router.get('/accept/:code',    ctrl.acceptInvite);
router.get('/dashboard/:code', ctrl.dashboard);

// Authenticated
router.use(authenticate);
router.post('/invite',   ctrl.invite);
router.get('/mine',      ctrl.listMine);
router.patch('/:id',     ctrl.updateLink);
router.delete('/:id',    ctrl.revoke);

module.exports = router;
