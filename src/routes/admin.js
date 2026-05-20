const { Router } = require('express');
const { adminAuth } = require('../middleware/adminAuth');
const ctrl = require('../controllers/admin');

const router = Router();
router.use(adminAuth);

router.get('/users', ctrl.listUsers);

module.exports = router;
