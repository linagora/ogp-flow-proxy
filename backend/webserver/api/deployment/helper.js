const constant = require('./constant');

function successResponse(requestId, data) {
  return {
    requestId,
    status: constant.STATUS.success,
    data
  };
}

function errorResponse(requestId, error, reason) {
  return {
    requestId,
    status: constant.STATUS.error,
    error,
    reason
  };
}

module.exports = {
  successResponse,
  errorResponse,
};
