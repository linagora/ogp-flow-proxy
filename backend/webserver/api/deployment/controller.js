'use strict';

const nginx = require('../../../core/nginx');
const swarm = require('../../../core/swarm');
const request = require('request');

const SERVICE_DEFAULT_PORT = 80;

function create(req, res) {
  if (!req.query.domain || !req.query.email) {
    return res.status(400).json({code: 400, message: 'Bad request', details: 'Missing domain or email'});
  }

  swarm.create(req.query.domain, req.query.email, (err, app, admin) => {
    if (err) {
      return res.status(500).json({code: 500, message: 'Server error', details: err.message});
    }

    _monitoring(app);

    res.send('Deploying your Openpaas instance, please wait. It maybe take few minutes \n'
              + `Your application's address is http://${app.appName} \n`
              + 'Your account: \n'
              + `Email: ${admin.email} \n`
              + `Password: ${admin.password} `
            );
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

function _monitoring(app) {
  const TIME_OUT = 60; // 10 minutes
  let counter = 0;
  const interval = setInterval(function() {
    counter++;

    request(`http://${app.upstream}:8080/api/monitoring`, function(err, response, body) {
      if (!err && response.statusCode == 200) {
        const opts = {
          name: app.appName,
          upstream: app.upstream,
          port: service.port || 8080
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
