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

function list(limit=20, offset=0) {
  return Deployment.find({})
    .limit(Number(limit))
    .skip(Number(offset));
}

function remove(id) {
  return Deployment.findByIdAndRemove(id);
}

module.exports = {
  findById,
  findByDomainName,
  create,
  list,
  remove
};
