const Deployment = require('../db').models.Deployment;

function findByDomainName(domainName) {
  return Deployment.findOne({ domainName });
}

module.exports = {
  findByDomainName,
};
