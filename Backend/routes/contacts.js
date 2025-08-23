const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');
const auth = require('../middleware/auth');

router.post('/', contactController.createContact);
router.get('/property/:propertyId', auth.verifyToken, contactController.getContactsByProperty);
router.get('/user/:userId', auth.verifyToken, contactController.getContactsByUser);

module.exports = router;