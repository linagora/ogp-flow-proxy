const Deployment = require('../db').models.Deployment;

function findByDomainName(domainName) {
  return Deployment.findOne({ domainName });
}

function findById(id) {
  return Deployment.findById(id);
}

function create(deployment) {
  const doc = new Deployment(deployment);

  return doc.save();
}

module.exports = {
  findById,
  findByDomainName,
  create,
};
