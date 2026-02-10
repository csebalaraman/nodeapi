const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
//const roleAuth = require('../middleware/roleAuth');
const c = require('../controllers/staffController');

// Only Pharmacy Admin can manage staff
router.post('/add', auth, c.addStaff);
router.get('/list', auth, c.listStaff);
router.get('/:id', auth, c.getStaff);
router.put('/update/:id', auth, c.updateStaff);
router.delete('/delete/:id', auth, c.deleteStaff);
router.post('/status/:id', auth, c.updateStaffStatus);

module.exports = router;
