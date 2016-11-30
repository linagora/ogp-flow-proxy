'use strict';

const fs = require('fs');
const dockerModem = require('docker-modem');
const _ = require('lodash');
const q = require('q');

const templatePath = '/usr/src/app/templates/stack-openpass.json';
const modem = new dockerModem();

function _createTemplate(requestId) {
  const templateObject = JSON.parse(fs.readFileSync(templatePath, 'utf8'));

  _.forEach(templateObject.Rules, (value, key) => {
    const serviceName = `${requestId}_${key}`;

    if (key !== 'Services') {
      value.Vars.host = serviceName;
      templateObject.Services[key].name = serviceName;
    }

    if (value.Networks) {
      value.Networks.map(net => {
        const network = process.env[net];

        templateObject.Services[key].Networks.push({Target: network});
      });
    };
  });

  _.forEach(templateObject.Rules, (value, key) => {
    if (key !== 'Services' && value.Env) {
      _.forEach(value.Env, (envValue, envKey) => {
        const res = eval(`module.exports = function () { const Rules = templateObject.Rules; return ${envValue}; }`);
        templateObject.Services[key].TaskTemplate.ContainerSpec.Env.push(`${envKey}=${res()}`);
      });
    }
  });

  return templateObject;
}

function create(requestId, callback) {
  const template = _createTemplate(requestId);
  const services = template.Rules.Services;

  const promises = services.map(service => {
    const defered = q.defer();
    const optsf = {
      path: '/services/create?',
      method: 'POST',
      options: template.Services[service],
      statusCodes: {
        200: true, // unofficial, but proxies may return it
        201: true,
        404: 'no such service',
        406: 'impossible to attach',
        500: 'server error'
      }
    };

    modem.dial(optsf, (err, data) => {
      if (err) {
        defered.reject(err);
      } else {
        defered.resolve();
      }
    });

    return defered.promise;
  });

  q.all(promises).then(function() {
    callback();
  }, function(err) {
    callback(err);
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

