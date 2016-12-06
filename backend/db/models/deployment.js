const mongoose = require('mongoose');
const emailAddresses = require('email-addresses');

function validateEmail(email) {
  return emailAddresses.parseOneAddress(email) !== null;
}

const deploymentSchema = mongoose.Schema({
  _id: { type: String, trim: true },
  requesterEmail: { type: String, trim: true, validate: validateEmail },
  domainName: { type: String, unique: true, trim: true, required: true },
  publicUrl: { type: String, trim: true, required: true },
  internalUrl: { type: String, trim: true, required: true },
});

module.exports = mongoose.model('Deployment', deploymentSchema);
