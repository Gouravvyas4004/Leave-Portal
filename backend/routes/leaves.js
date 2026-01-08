const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { applyLeave, listLeaves, approveLeave, rejectLeave, getBalance } = require('../controllers/leaveController');

// --- GATEKEEPER (DRY Fix) ---
// Apply auth middleware to ALL routes defined below this line
router.use(auth);

// --- PROTECTED ROUTES ---
// No need to repeat 'auth' here anymore
router.post('/', applyLeave);
router.get('/', listLeaves);
router.post('/:id/approve', approveLeave);
router.post('/:id/reject', rejectLeave);
router.get('/balance/:userId', getBalance);

module.exports = router;