'use strict';

const fs = require('fs');
const dockerModem = require('docker-modem');

const templatePath = '/usr/src/app/templates/services-create.json';
const modem = new dockerModem();

function _createTemplate(requestId, callback) {
  fs.readFile(templatePath, function(err, data) {
    if (err) {
      callback(err);
    }

    const networks = [process.env.NET_APP, process.env.NET_PROXY];
    const templateObject = JSON.parse(fs.readFileSync(templatePath, 'utf8'));

    templateObject.name = requestId;
    networks.map(net => {
      templateObject.Networks.push({Target: net});
    });

    callback(null, templateObject);
  });
}

function _isServiceRunning(serviceName, callback) {
   const optsf = {
    path: '/tasks?',
    method: 'GET',
    options: {service: serviceName},
    statusCodes: {
      200: true,
      500: 'Server error'
    }
  };

  modem.dial(optsf, function(err, data) {
    if (err) {
      callback(err);
    }
    console.log(data[0]);
      if (data[0]) {
        if (data[0].Status.State === 'running') {
        callback(null, true);
      }
    }

    callback(null, false);
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

    modem.dial(optsf, function(err, data) {
      if (err) {
        callback(err);
      }
        setTimeout(function() { callback(); }, 5000);
    });
  });
}

function stop() {

}

module.exports = {
  create,
  stop
};
