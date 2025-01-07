const express = require('express');
const router = express.Router();
const productController = require('./product.controller');

router.post('/', productController.createProduct);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProduct);
router.delete('/:id', productController.deleteProduct);
router.patch('/:id', productController.updateProduct);

module.exports = router;
