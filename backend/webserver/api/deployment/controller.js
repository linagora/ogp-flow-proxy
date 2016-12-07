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
  const requestId = req.params.requestId;

  deploymentModule.findById(requestId).then((deployment) => {
    if (!deployment) {
      return res.status(404).json({
        status: 'not found'
      });
    }

    const domain = deployment.domainName;

    nginx.remove(domain, err => {
      if (err) {
        return res.status(500).json({ code: 500, message: 'Server error', details: err.message });
      }

      swarm.remove(domain, err => {
        if (err) {
          return res.status(500).json({ code: 500, message: 'Server error', details: err.message });
        }

        deploymentModule.remove(requestId).then((deployment) => {
          res.status(204).end();
        }, err => {
          console.log('Error while remove instance\'s metadata', requestId, err);

          return res.status(500).json({
            error: {
              code: 500,
              message: 'Server Error',
              details: 'Error while remove instance\'s metadata'
            }
          });
        });
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

function getDeployment(req, res) {
  const requestId = req.params.requestId;

  deploymentModule.findById(requestId).then((deployment) => {
    if (!deployment) {
      return res.status(404).json({
        status: 'not found'
      });
    }

    return res.status(200).json(deployment);
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

function listDeployments(req, res) {
  const requestId = req.params.requestId;

  deploymentModule.list(req.query.limit, req.query.offset).then((deployments) => {
    return res.status(200).json(deployments);
  }, err => {
    console.log('Error while finding deployments', requestId, err);

    return res.status(500).json({
      error: {
        code: 500,
        message: 'Server Error',
        details: 'Error while finding deployments'
      }
    });
  });
}

module.exports = {
  create,
  remove,
  getDeploymentStatus,
  getDeployment,
  listDeployments
};
