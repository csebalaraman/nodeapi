const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');
const c = require('../controllers/inventoryController');

router.post('/add-product', auth, c.addProduct);
router.put('/update-product', auth, c.updateProduct);
router.delete('/delete-product', auth, c.deleteProduct);
router.get('/filter', auth, c.filterProducts);
router.get('/get-products', auth, c.getProducts);


module.exports = router;
