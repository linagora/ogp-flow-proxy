'use strict';

const nginx = require('./utils/nginx');
const swarm = require('./utils/swarm');

const SERVICE_DEFAULT_PORT = 8080;

function create(req, res) {
    swarm.create(req.query.requestId, function(err, data) {
      if (err) {
        res.status(500).json({code: 500, message: 'Server error', details: err.message});
      }

      const opts = {
        name: req.query.requestId,
        port: SERVICE_DEFAULT_PORT,
        domain: req.query.domain
      };

      nginx.create(opts, function(err) {
        if (err) {
          res.status(500).json({code: 500, message: 'Server error', details: err.message});
        }

        res.status(200);
      });
    });
}

function stop() {
}

module.exports = {
  create,
  stop
};
