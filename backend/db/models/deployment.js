const mongoose = require('mongoose');
const emailAddresses = require('email-addresses');

function validateEmail(email) {
  return emailAddresses.parseOneAddress(email) !== null;
}

const deploymentSchema = mongoose.Schema({
  requestId: { type: String, trim: true, required: true },
  requesterEmail: { type: String, trim: true, validate: validateEmail },
  domainName: { type: String, unique: true, trim: true, required: true },
});

module.exports = mongoose.model('Deployment', deploymentSchema);
