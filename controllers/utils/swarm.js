'use strict';

const fs = require('fs');
const dockerModem = require('docker-modem');

const templatePath = '/usr/src/app/templates/services-create.json';
const modem = new dockerModem();

function _createTemplate(requestId, callback) {
  const networks = [process.env.NET_APP, process.env.NET_PROXY];
  const templateObject = JSON.parse(fs.readFileSync(templatePath, 'utf8'));

  templateObject.name = requestId;
  networks.map(net => {
    templateObject.Networks.push({Target: net});
  });

  callback(null, templateObject);
}

function create(requestId, callback) {
  _createTemplate(requestId, (err, tempalte) => {
    if (err) {
      return callback(err);
    }

    const optsf = {
      path: '/services/create?',
      method: 'POST',
      options: tempalte,
      statusCodes: {
        200: true, // unofficial, but proxies may return it
        201: true,
        404: 'no such service',
        406: 'impossible to attach',
        500: 'server error'
      }
    };

    modem.dial(optsf, (err, data) => {
      setTimeout(function() { callback(); }, 5000);
    });
  });
}

function remove(serviceName, callback) {
  const optsf = {
    path: `/services/${serviceName}`,
    method: 'DELETE',
    statusCodes: {
      200: true,
      404: 'no such service',
      500: 'server error'
    }
  };

  modem.dial(optsf, callback);
}

module.exports = {
  create,
  remove
};
