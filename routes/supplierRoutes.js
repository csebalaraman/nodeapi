const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');

const c = require('../controllers/supplierController');


router.post('/add', auth, c.addSupplier);

router.get('/list', auth, c.listSuppliers);

router.get('/:id', auth, c.getSupplier);

router.put('/update/:id', auth, c.updateSupplier);

router.delete('/delete/:id', auth, c.deleteSupplier);

router.post('/status/:id', auth, c.updateSupplierStatus);

module.exports = router;