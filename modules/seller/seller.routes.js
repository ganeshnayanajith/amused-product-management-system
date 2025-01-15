const express = require('express');
const router = express.Router();
const sellerController = require('./seller.controller');

router.post('/register', sellerController.register);
router.post('/login', sellerController.login);

module.exports = router;
