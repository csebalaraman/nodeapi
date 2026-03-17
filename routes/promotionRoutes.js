const express = require('express');
const router = express.Router();

const auth = require('../middleware/auth');

const c = require('../controllers/promotionController');


router.post('/add', auth, c.createOffer);

router.get('/list', auth, c.listOffers);

router.get('/:id', auth, c.getOffer);

router.put('/update/:id', auth, c.updateOffer);

router.delete('/delete/:id', auth, c.deleteOffer);

router.post('/status/:id', auth, c.updateOfferStatus);

module.exports = router;