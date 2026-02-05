const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const c = require('../controllers/customerController');

router.post('/add-customer', auth, c.addCustomer);
router.get('/list', auth, c.getAllCustomers);
router.get('/view/:id', auth, c.viewCustomerProfile);
router.post('/notes/:id', auth, c.saveCustomerNotes);
router.get('/stats', auth, c.customerStats);

module.exports = router;