const nginx = require('../../../core/nginx');
const swarm = require('../../../core/swarm');
const request = require('request');
const helper = require('./helper');

function create(req, res) {
  const requestId = req.body.requestId;
  const domainName = req.body.domainName;
  const requesterEmail = req.body.requesterEmail;

  swarm.create(domainName, requesterEmail, (err, app, admin) => {
    if (err) {
      console.log('Error while creating Swarm services', err);

      const jsonRes = helper.errorResponse(requestId, 'Server Error', 'Cannot create Swarm services');

      return res.status(500).json(jsonRes);
    }

    _monitoring(app);

    const instanceHome = app.appName;
    const password = admin.password;

    const jsonRes = helper.successResponse(requestId, instanceHome, requesterEmail, password);
    return res.status(202).json(jsonRes);
  });
}

function remove(req, res) {
  if (!req.query.domain) {
    return res.status(400).json({ code: 400, message: 'Bad request', details: 'Missing domain' });
  }

  nginx.remove(req.query.domain, (err) => {
    if (err) {
      return res.status(500).json({ code: 500, message: 'Server error', details: err.message });
    }

    swarm.remove(req.query.domain, (err) => {
      if (err) {
        return res.status(500).json({ code: 500, message: 'Server error', details: err.message });
      }

      res.send('Removing Openpaas instance successfully');
    });
  });
}

function _monitoring(app) {
  const TIME_OUT = 60; // 10 minutes
  let counter = 0;
  const interval = setInterval(() => {
    counter += 1;

    request(`http://${app.upstream}:8080/api/monitoring`, (err, response) => {
      if (!err && response.statusCode === 200) {
        const opts = {
          name: app.appName,
          upstream: app.upstream,
          port: app.port || 8080
        };

        nginx.create(opts, (err) => {
          if (err) {
            return console.log('Can not reload nginx');
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
