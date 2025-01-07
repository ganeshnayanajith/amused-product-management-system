module.exports = {
  API: {
    BASE_PATH: '/api',
  },

  HTTP_CODES: {
    OK: 200,
    CREATED: 201,
    NO_CONTENT: 204,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    UNPROCESSABLE_ENTITY: 422,
    SERVER_ERROR: 500,
  },

  ERRORS: {
    SERVER_ERROR: 'ServerError',
    VALIDATION_ERROR: 'ValidationError',
    AUTHENTICATION_ERROR: 'AuthenticationFailError',
    AUTHORIZATION_ERROR: 'AuthorizationFailError',
    FORBIDDEN_ERROR: 'ForbiddenError',
    NOT_FOUND_ERROR: 'NotFoundError',
    UNPROCESSABLE_ENTITY_ERROR: 'UnprocessableEntityError',
    BAD_REQUEST_ERROR: 'BadRequestError',
  },

  MESSAGES: {
    SOMETHING_WENT_WRONG: 'Something went wrong',
  },

  SALT_ROUNDS: 10,
};
