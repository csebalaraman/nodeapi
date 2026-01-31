const express = require('express');
const router = express.Router();

const c = require('../controllers/authController');
const auth = require('../middleware/auth');
const roleAuth = require('../middleware/roleAuth');

router.post('/register', c.register);
router.post('/login', c.login);
router.post('/logout', c.logout);

// 🔐 Protected route (any authenticated user)
router.put('/update-profile', auth, c.updateProfile);

// 🔐 Protected routes (role-based)
// router.get('/admin-dashboard', auth, roleAuth(['admin', 'superadmin']), (req, res) => {
//   res.json({ message: 'Admin dashboard', user: req.user });
// });
// 
// router.get('/superadmin-panel', auth, roleAuth(['superadmin']), (req, res) => {
//   res.json({ message: 'Superadmin panel', user: req.user });
// });

module.exports = router;
