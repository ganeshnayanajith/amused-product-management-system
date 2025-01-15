const express = require('express');
const router = express.Router();
const productController = require('./product.controller');
const authenticator = require('../../lib/security/authenticator');
const authorizer = require('../../lib/security/authorizer');

router.post('/', authenticator, authorizer(['seller']), productController.createProduct);
router.get('/', authenticator, authorizer(['seller']), productController.getAllProducts);
router.get('/:id', authenticator, authorizer(['seller']), productController.getProduct);
router.delete('/:id', authenticator, authorizer(['seller']), productController.deleteProduct);
router.patch('/:id', authenticator, authorizer(['seller']), productController.updateProduct);

module.exports = router;
