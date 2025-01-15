const CustomHttpError = require('../custom-http-error');
const { HTTP_CODES, ERRORS } = require('../constants');
const Utils = require('../utils');

const getAuthorized = (roles) => {
  return (req, res, next) => {
    try {
      if (roles.includes(req.user.role)) {
        next();
      } else {
        throw new CustomHttpError(HTTP_CODES.FORBIDDEN, ERRORS.AUTHENTICATION_ERROR, 'Forbidden! You are not authorized to access this resource!');
      }
    } catch (error) {
      Utils.errorResponse(res, error);
    }
  }
};

module.exports = getAuthorized;