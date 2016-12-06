const nginx = require('../../../core/nginx');
const swarm = require('../../../core/swarm');
const deploymentModule = require('../../../core/deployment');
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

    deploymentModule.create({
      _id: requestId,
      domainName,
      requesterEmail,
      publicUrl: app.appName,
      internalUrl: `${app.upstream}:8080`
    })
    .then(deployment => {
      _monitoring(app);

      const data = {
        publicUrl: app.appName,
        publicIp: 'http://server-ip',
        administrator: {
          login: admin.email,
          password: admin.password
        },
        links: {
          deploymentStatus: `http://server-ip/api/deployments/${deployment._id}/status`
        }
      };

      const jsonRes = helper.successResponse(requestId, data);
      return res.status(202).json(jsonRes);
    }, err => {
      console.log('Error while creating deployment', err);

      const jsonRes = helper.errorResponse(requestId, 'Server Error', 'Cannot create deployment');

      return res.status(500).json(jsonRes);
    });
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

function getDeploymentStatus(req, res) {
  const requestId = req.params.requestId;

  deploymentModule.findById(requestId).then((deployment) => {
    if (!deployment) {
      return res.status(404).json({
        status: 'not found'
      });
    }

    request(`http://${deployment.internalUrl}/api/monitoring`, (err, response) => {
      if (!err && response.statusCode === 200) {
        return res.status(404).json({
          status: 'up'
        });
      }

      return res.status(404).json({
        status: 'down'
      });
    });
  }, err => {
    console.log('Error while finding deployment', requestId, err);

    return res.status(500).json({
      error: {
        code: 500,
        message: 'Server Error',
        details: 'Error while finding deployment'
      }
    });
  });
}

module.exports = {
  create,
  remove,
  getDeploymentStatus,
};
