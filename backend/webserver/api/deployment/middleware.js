const helper = require('./helper');
const deploymentModule = require('../../../core/deployment');
const emailAddresses = require('email-addresses');

function validateEmail(email) {
  return emailAddresses.parseOneAddress(email) !== null;
}

function canCreate(req, res, next) {
  // todo
  next();
}

function hasValidRequestData(req, res, next) {
  const requestId = req.body.requestId;
  const requesterEmail = req.body.requesterEmail;
  const domainName = req.body.domainName;

  if (!requestId || !requesterEmail || !domainName) {
    const jsonRes = helper.errorResponse(requestId, 'Bad Request', 'requestId and/or requesterEmail and/or domainName is/are missing');

    return res.status(400).json(jsonRes);
  }

  if (!validateEmail(requesterEmail)) {
    const jsonRes = helper.errorResponse(requestId, 'Bad Request', 'requesterEmail is not valid email address');

    return res.status(400).json(jsonRes);
  }

  next();
}

function requireUniqueDomain(req, res, next) {
  const domainName = req.body.domainName;
  const requestId = req.body.requestId;

  deploymentModule.findByDomainName(domainName).then(deployment => {
    if (deployment) {
      const jsonRes = helper.errorResponse(requestId, 'Bad Request', 'domainName is existing');

      return res.status(400).json(jsonRes);
    }

    next();
  }, err => {
    const message = 'Error while finding deployment by domainName';

    console.log(message, domainName, err);
    next(new Error(message));
  });
}

function requireUniqueRequestId(req, res, next) {
  const requestId = req.body.requestId;

  deploymentModule.findById(requestId).then(deployment => {
    if (deployment) {
      const jsonRes = helper.errorResponse(requestId, 'Bad Request', 'requestId is existing');

      return res.status(400).json(jsonRes);
    }

    next();
  }, err => {
    const message = 'Error while finding deployment by requestId';

    console.log(message, requestId, err);
    next(new Error(message));
  });
}

module.exports = {
  canCreate,
  hasValidRequestData,
  requireUniqueRequestId,
  requireUniqueDomain,
};
