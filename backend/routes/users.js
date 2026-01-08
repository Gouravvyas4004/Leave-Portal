const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { listUsers, getUserDetails } = require('../controllers/userController');

router.get('/', auth, listUsers);
router.get('/:id', auth, getUserDetails);

module.exports = router;