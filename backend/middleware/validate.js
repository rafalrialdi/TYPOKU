const { validationResult } = require('express-validator');
const { sendError } = require('../utils/response');

function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map((err) => ({
      field: err.path || err.param,
      message: err.msg,
    }));
    return sendError(res, formattedErrors[0].message, 422, formattedErrors);
  }
  return next();
}

module.exports = validate;
