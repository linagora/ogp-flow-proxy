'use strict';

const nginx = require('./utils/nginx');
const swarm = require('./utils/swarm');

const SERVICE_DEFAULT_PORT = 80;

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

      nginx.create(opts, function(err, stdout, stderr) {
        console.log(1111, stdout, stderr);

        if (err) {
          return  res.status(500).json({code: 500, message: 'Server error', details: err.message});
        }

        res.send(`Your application's address is http://${opts.name}.${opts.domain}`);
      });
    });
}

function stop() {
}

module.exports = {
  create,
  stop
};
