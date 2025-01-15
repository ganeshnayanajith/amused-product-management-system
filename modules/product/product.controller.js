const { HTTP_CODES, ERRORS } = require('../../lib/constants');
const CustomHttpError = require('../../lib/custom-http-error');
const Utils = require('../../lib/utils');
const ProductService = require('./product.service');
const ProductValidator = require('./product.validator');

exports.createProduct = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const validatedPayload = ProductValidator.validateCreateProduct(req.body);
    const product = await ProductService.createProduct(sellerId, validatedPayload);
    Utils.successResponse(res, HTTP_CODES.CREATED, 'Product created successfully', product);
  } catch (error) {
    Utils.errorResponse(res, error);
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const products = await ProductService.getAllProducts(sellerId);
    Utils.successResponse(res, HTTP_CODES.OK, 'Products fetched successfully', products);
  } catch (error) {
    Utils.errorResponse(res, error);
  }
};

exports.getProduct = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const product = await ProductService.getProduct(sellerId, req.params.id);
    if (!product) {
      throw new CustomHttpError(HTTP_CODES.NOT_FOUND, ERRORS.NOT_FOUND_ERROR, 'Product not found');
    }
    Utils.successResponse(res, HTTP_CODES.OK, 'Product fetched successfully', product);
  } catch (error) {
    Utils.errorResponse(res, error);
  }
};

exports.deleteProduct = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    await ProductService.deleteProduct(sellerId, req.params.id);
    Utils.successResponse(res, HTTP_CODES.OK, 'Product deleted successfully', true);
  } catch (error) {
    Utils.errorResponse(res, error);
  }
};

exports.updateProduct = async (req, res) => {
  try {
    const sellerId = req.user.userId;
    const validatedPayload = ProductValidator.validateUpdateProduct(req.body);
    const product = await ProductService.updateProduct(sellerId, req.params.id, validatedPayload);
    if (!product) {
      throw new CustomHttpError(HTTP_CODES.NOT_FOUND, ERRORS.NOT_FOUND_ERROR, 'Product not found');
    }
    Utils.successResponse(res, HTTP_CODES.OK, 'Product updated successfully', product);
  } catch (error) {
    Utils.errorResponse(res, error);
  }
};