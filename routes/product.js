const router = require('express').Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload'); // 👈 multer
const c = require('../controllers/productController');

router.post('/', auth, upload.single('image'), c.create);
router.get('/', auth, c.list);
router.put('/:id', auth, upload.single('image'), c.update);
router.get('/search', auth, c.search);
router.get('/:id', auth, c.show);
router.delete('/:id', auth, c.delete);


module.exports = router;
