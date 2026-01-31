const express = require('express');
const router = express.Router();

const c = require('../controllers/authController');
const auth = require('../middleware/auth');

router.post('/register', c.register);
router.post('/login', c.login);
router.post('/logout', c.logout);

// 🔐 Protected route
router.put('/update-profile', auth, c.updateProfile);

module.exports = router;
