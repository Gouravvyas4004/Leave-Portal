const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { listUsers, getUserDetails } = require('../controllers/userController');

// --- GATEKEEPER (DRY Fix) ---
router.use(auth);

// --- PROTECTED ROUTES ---
router.get('/', listUsers);
router.get('/:id', getUserDetails);

module.exports = router;