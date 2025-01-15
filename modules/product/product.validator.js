const Joi = require('joi');
const CustomHttpError = require('../../lib/custom-http-error');
const { HTTP_CODES, ERRORS } = require('../../lib/constants');

const schemaCreateProduct = Joi.object().keys({
  productName: Joi.string().required(),
  description: Joi.string().required(),
  price: Joi.number().required().positive(),
  quantity: Joi.number().default(0),
  category: Joi.string().required(),
});

const schemaUpdateProduct = Joi.object().keys({
  productName: Joi.string().optional(),
  description: Joi.string().optional(),
  price: Joi.number().optional(),
  quantity: Joi.number().optional(),
  category: Joi.string().optional(),
});

class ProductValidator {
  static validateCreateProduct(obj) {
    const { value, error } = schemaCreateProduct.validate(obj);
    if (error) {
      throw new CustomHttpError(HTTP_CODES.BAD_REQUEST, ERRORS.VALIDATION_ERROR, error.message);
    }
    return value;
  }

  static validateUpdateProduct(obj) {
    const { value, error } = schemaUpdateProduct.validate(obj);
    if (error) {
      throw new CustomHttpError(HTTP_CODES.BAD_REQUEST, ERRORS.VALIDATION_ERROR, error.message);
    }
    return value;
  }
}

module.exports = ProductValidator;
