const { ERRORS, MESSAGES, HTTP_CODES, SALT_ROUNDS } = require('./constants');
const logger = require('./logger');
const jwt = require('jsonwebtoken');
const secretConfigs = require('../secret-configs');
const bcrypt = require('bcrypt');
const CustomHttpError = require('./custom-http-error');

class Utils {
  static async hashPassword(password) {
    try {
      const salt = await bcrypt.genSalt(SALT_ROUNDS);
      const hashedPassword = await bcrypt.hash(password, salt);
      return Promise.resolve(hashedPassword);
    } catch (error) {
      return Promise.reject(new CustomHttpError(HTTP_CODES.SERVER_ERROR, ERRORS.SERVER_ERROR, 'Error hashing password'));
    }
  }

  static async comparePasswords(password, hashedPassword) {
    try {
      const result = await bcrypt.compare(password, hashedPassword);
      return Promise.resolve(result);
    } catch (error) {
      return Promise.reject(new CustomHttpError(HTTP_CODES.SERVER_ERROR, ERRORS.SERVER_ERROR, 'Error comparing passwords'));
    }
  }

  static async generateToken(data) {
    try {
      const opts = {
        expiresIn: '1d',
      };
      const token = jwt.sign(data, secretConfigs.JWT_SECRET, opts);
      return Promise.resolve(token);
    } catch (error) {
      logger.error(error);
      return Promise.reject(error);
    }
  }

  static async decodeToken(token) {
    try {
      const payload = await jwt.verify(token, secretConfigs.JWT_SECRET);
      return Promise.resolve(payload);
    } catch (error) {
      logger.error(error);
      return Promise.reject(error);
    }
  }

  static successResponse(res, status, message, data) {
    return res.status(status).send({
      status,
      message,
      data,
      error: null,
    });
  }

  static errorResponse(res, err) {
    logger.error(`Error : ${err}`);
    logger.error(`Error : ${JSON.stringify(err)}`);
    let status = HTTP_CODES.SERVER_ERROR;
    let error = ERRORS.SERVER_ERROR;
    let message = MESSAGES.SOMETHING_WENT_WRONG;

    if (err.message) {
      message = err.message;
    }

    if (err.errors && err.errors[0] && err.errors[0].message) {
      status = HTTP_CODES.BAD_REQUEST;
      message = err.errors[0].message;
    }

    if (err.name) {
      error = err.name;
    }

    if (err.status) {
      status = err.status;
    }

    return res.status(status).send({
      status,
      error,
      message,
      data: null,
    });
  }
}

module.exports = Utils;
