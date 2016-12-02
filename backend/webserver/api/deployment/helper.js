const constant = require('./constant');

function successResponse(requestId, instanceHome, administrator, password) {
  return {
    requestId,
    status: constant.STATUS.success,
    instanceHome,
    administrator,
    password
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
