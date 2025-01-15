'use strict';
const Utils = require('../utils');
const CustomHttpError = require('../custom-http-error');
const { HTTP_CODES, ERRORS } = require('../constants');
const moment = require('moment');
const SellerService = require('../../modules/seller/seller.service');


module.exports = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      throw new CustomHttpError(HTTP_CODES.UNAUTHORIZED, ERRORS.AUTHENTICATION_ERROR, 'Authentication token is required!');
    }

    const payload = await Utils.decodeToken(token);

    // check if the token is expired
    if (payload.exp <= moment().unix()) {
      throw new CustomHttpError(HTTP_CODES.UNAUTHORIZED, ERRORS.AUTHENTICATION_ERROR, 'Authentication token is expired!');
    }

    const user = await SellerService.getSellerByIdAndEmail(payload.userId, payload.email);

    if (!user) {
      throw new CustomHttpError(HTTP_CODES.UNAUTHORIZED, ERRORS.AUTHENTICATION_ERROR, 'Invalid authentication token!');
    }

    req.user = payload;

    next();

  } catch (error) {
    Utils.errorResponse(res, error);
  }
};
