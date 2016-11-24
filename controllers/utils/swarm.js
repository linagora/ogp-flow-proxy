'use strict';

const fs = require('fs');
const dockerModem = require('docker-modem');

const templatePath = '/usr/src/app/templates/services-create.json';

function _createTemplate(requestId, callback) {
  fs.readFile(templatePath, function(err, data) {
    if (err) {
      callback(err);
    }

    const templateObject = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
    templateObject.name = requestId;

    callback(null, templateObject);
  });
}

function create(requestId, callback) {
  _createTemplate(requestId, function(err, tempalte) {
    if (err) {
      callback(err);
    }

    const optsf = {
      path: '/services/create?',
      method: 'POST',
      options: tempalte,
      statusCodes: {
        200: true, // unofficial, but proxies may return it
        201: true,
        404: 'no such container',
        406: 'impossible to attach',
        500: 'server error'
      }
    };

    const modem = new dockerModem();

    modem.dial(optsf, function(err, data) {
      if (err) {
        callback(err);
      }

      callback();
    });
  });
}

function stop() {

}

module.exports = {
  create,
  stop
};
