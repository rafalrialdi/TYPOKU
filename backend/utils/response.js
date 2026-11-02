function sendSuccess(res, message, data = null, statusCode = 200) {
  const payload = {
    status: 'success',
    message,
  };
  if (data !== null && data !== undefined) {
    payload.data = data;
  }
  return res.status(statusCode).json(payload);
}

function sendError(res, message, statusCode = 500, errors = null) {
  const payload = {
    status: 'error',
    message,
  };
  if (errors !== null && errors !== undefined) {
    payload.errors = errors;
  }
  return res.status(statusCode).json(payload);
}

module.exports = {
  sendSuccess,
  sendError,
};
