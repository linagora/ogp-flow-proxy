'use strict';

const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');

const configDir = '/etc/nginx/conf.d/';

function create(opts, cb) {
  const config = ''
        + 'server {\n'
        +   'listen 80; \n'
        +   `server_name ${opts.name}.${opts.domain}; \n`
        +   'location / { \n'
        +     `proxy_pass http://${opts.name}:${opts.port}; \n`
        +     'proxy_set_header X-Forwarded-For $remote_addr;\n'
        +     'proxy_buffering off;\n'
        +   '} \n'
        + '}';
  const confPath = path.join(configDir, opts.name + '.conf');

  fs.writeFile(confPath, config, function(err) {
    if (err) return cb(err)

    _check(function(checkErr) {
      if (checkErr) {
        fs.unlink(confPath, function(err) {
          if (err) return cb(err);
          cb(checkErr);
		});
      } else {
        _reload(cb);
      }
    });
  });
}

function remove(name, callback) {
}

function _reload(cb) {
  exec('nginx -s reload', cb);
}

function _check(cb) {
  exec('nginx -t', cb);
}

module.exports = {
  create,
  remove
}
