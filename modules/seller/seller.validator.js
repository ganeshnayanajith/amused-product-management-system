const Joi = require('joi');
const CustomHttpError = require('../../lib/custom-http-error');
const { HTTP_CODES, ERRORS } = require('../../lib/constants');

const schemaRegister = Joi.object().keys({
  name: Joi.string().required(),
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

const schemaLogin = Joi.object().keys({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

class SellerValidator {
  static validateRegister(obj) {
    const { value, error } = schemaRegister.validate(obj);
    if (error) {
      throw new CustomHttpError(HTTP_CODES.BAD_REQUEST, ERRORS.VALIDATION_ERROR, error.message);
    }
    return value;
  }

  static validateLogin(obj) {
    const { value, error } = schemaLogin.validate(obj);
    if (error) {
      throw new CustomHttpError(HTTP_CODES.BAD_REQUEST, ERRORS.VALIDATION_ERROR, error.message);
    }
    return value;
  }
}

module.exports = SellerValidator;
