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

  const appName = `${domainName}.ogp-toolbox.open-paas.org`;
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
      value.Networks.forEach(net => {
        const network = process.env[net];

        templateObject.Services[key].Networks.push({ Target: network });
      });
    }
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
      appName,
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

    modem.dial(optsf, (err) => {
      if (err) {
        defered.reject(err);
      } else {
        defered.resolve();
      }
    });

    return defered.promise;
  });

  q.all(promises).then(() => {
    callback(null, instanceInfo.app, instanceInfo.admin);
  }, (err) => {
    callback(err);
  });
}

function remove(domainName, callback) {
  const templateObject = _.cloneDeep(TEMPLATE);
  const services = Object.keys(templateObject.Services);

  const promises = _.forEach(services, (service) => {
    const defered = q.defer();

    const optsf = {
      path: `/services/${domainName}_${service}`,
      method: 'DELETE',
      statusCodes: {
        200: true,
        404: 'no such service',
        500: 'server error'
      }
    };

    modem.dial(optsf, (err) => {
      if (err) {
        defered.reject();
      } else {
        defered.resolve();
      }
    });

    return defered.promise;
  });

  q.all(promises).then(() => callback(), err => callback(err));
}

module.exports = {
  create,
  remove
};
