const { HTTP_CODES } = require('../../lib/constants');
const Utils = require('../../lib/utils');
const SellerService = require('./seller.service');
const SellerValidator = require('./seller.validator');

exports.register = async (req, res) => {
  try {
    const payload = await SellerValidator.validateRegister(req.body);
    const result = await SellerService.register(payload);
    Utils.successResponse(res, HTTP_CODES.CREATED, 'Seller registered successfully', result);
  } catch (error) {
    Utils.errorResponse(res, error);
  }
};

exports.login = async (req, res) => {
  try {
    const payload = await SellerValidator.validateLogin(req.body);
    const result = await SellerService.login(payload);
    Utils.successResponse(res, HTTP_CODES.OK, 'Seller logged in successfully', result);
  } catch (error) {
    Utils.errorResponse(res, error);
  }
};