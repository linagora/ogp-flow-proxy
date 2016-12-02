'use strict';

const fs = require('fs');
const dockerModem = require('docker-modem');
const _ = require('lodash');
const q = require('q');
const TEMPLATE = require('../../templates/stack-openpass.json');
const generatePassword = require('password-generator');

const modem = new dockerModem();

function _generatePassword() {
 return generatePassword(12, false);
}

function _createTemplate(domainName, requestEmail) {
  const templateObject = _.cloneDeep(TEMPLATE);

  const appName = `${domainName}.beta.data.gouv.fr`;
  const adminPassword = _generatePassword();

  templateObject.Main = domainName + '_' + templateObject.Main;
  templateObject.Inputs = {
    ESN_ADMIN_EMAIL: requestEmail,
    ESN_ADMIN_PASSWORD: adminPassword,
    ESN_DOMAIN: domainName,
    ESN_COMPANY: domainName
  };

  _.forEach(templateObject.Rules, (value, key) => {
    const serviceName = `${domainName}_${key}`;

    if (key !== 'Services') {
       value.Vars.host = serviceName;

       templateObject.Services[key].name = value.Vars.host;
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
        const res = eval(`module.exports = function () { const Rules = templateObject.Rules; const Inputs = templateObject.Inputs; return ${envValue}; }`);
        templateObject.Services[key].TaskTemplate.ContainerSpec.Env.push(`${envKey}=${res()}`);
      });
    }
  });

  return {
    template: templateObject,
    app: {
      appName: appName,
      upstream: templateObject.Main
    },
    admin: {
      email: requestEmail,
      password: adminPassword
    }
  };
}

function create(domainName, requestEmail, callback) {
  const instanceInfo = _createTemplate(domainName, requestEmail);
  const template = instanceInfo.template;
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
    callback(null, instanceInfo.app, instanceInfo.admin);
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
