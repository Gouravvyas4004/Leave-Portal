const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { applyLeave, listLeaves, approveLeave, rejectLeave, getBalance } = require('../controllers/leaveController');

// Protected endpoints
router.post('/', auth, applyLeave);
router.get('/', auth, listLeaves);
router.post('/:id/approve', auth, approveLeave);
router.post('/:id/reject', auth, rejectLeave);
router.get('/balance/:userId', auth, getBalance);

module.exports = router;
