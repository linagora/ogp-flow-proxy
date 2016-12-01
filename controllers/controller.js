'use strict';

const nginx = require('./utils/nginx');
const swarm = require('./utils/swarm');
const scheduler = require('./utils/scheduler');
const request = require('request');

const SERVICE_DEFAULT_PORT = 80;

function create(req, res) {
  swarm.create(req.query.requestId, (err, data) => {
    if (err) {
      return res.status(500).json({code: 500, message: 'Server error', details: err.message});
    }

    const service = {
      name: data,
      domain: req.query.domain
    };
    _monitoring(service);

    res.send(`Your application's address is http://${service.name}.${service.domain} \n This progress maybe take several minutes, we will send email to notify application's state`);
  });
}

function remove(req, res) {
  nginx.remove(req.query.serviceName, (err) => {
    if (err) {
      return res.status(500).json({code: 500, message: 'Server error', details: err.message});
    }

    swarm.remove(req.query.serviceName, (err) => {
      if (err) {
        return res.status(500).json({code: 500, message: 'Server error', details: err.message});
      }

      res.status(200);
    });
  });
}

function _monitoring(service) {
  const TIME_OUT = 60; // 10 minutes
  let counter = 0;
  const interval = setInterval(function() {
    counter++;

    request(`http://${service.name}:8080/api/monitoring`, function(err, response, body) {
      if (!err && response.statusCode == 200) {
        const opts = {
          name: service.name,
          port: service.port || 8080,
          domain: service.domain
        };

        nginx.create(opts, (err) => {
          if (err) {
            console.log('Can not reload nginx');
          }

          console.log('Deploying application is successfully');
        });

        clearInterval(interval);
      }
    });

    if (counter >= TIME_OUT) {
      clearInterval(interval);
    }
  }, 10000);
}

module.exports = {
  create,
  remove
};
