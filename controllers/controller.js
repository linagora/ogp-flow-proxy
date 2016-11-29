'use strict';

const nginx = require('./utils/nginx');
const swarm = require('./utils/swarm');

const SERVICE_DEFAULT_PORT = 80;

function create(req, res) {
  swarm.create(req.query.requestId, (err, data) => {
    if (err) {
      return res.status(500).json({code: 500, message: 'Server error', details: err.message});
    }

    const opts = {
      name: req.query.requestId,
      port: SERVICE_DEFAULT_PORT,
      domain: req.query.domain
    };

    nginx.create(opts, (err) => {
      if (err) {
        return  res.status(500).json({code: 500, message: 'Server error', details: err.message});
      }

      res.send(`Your application's address is http://${opts.name}.${opts.domain}`);
    });
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

module.exports = {
  create,
  stop
};
