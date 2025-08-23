const express = require('express');
const router = express.Router();
const propertyController = require('../controllers/propertyController');
const auth = require('../middleware/auth');

router.get('/', propertyController.getAllProperties);
router.get('/:id', propertyController.getPropertyById);
router.post('/', auth.verifyToken, auth.isAgent, propertyController.createProperty);
router.put('/:id', auth.verifyToken, auth.isAgent, propertyController.updateProperty);
router.delete('/:id', auth.verifyToken, auth.isAgent, propertyController.deleteProperty);

module.exports = router;