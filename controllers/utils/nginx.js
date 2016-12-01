'use strict';

const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');

const configDir = '/etc/nginx/conf.d/';

function create(opts, callback) {
  const config = ''
        + 'server {\n'
        +   'listen 80; \n'
        +   `server_name ${opts.name}.${opts.domain}; \n`
        +   'location / { \n'
        +     'proxy_http_version 1.1; \n'
        +     'proxy_set_header Upgrade $http_upgrade; \n'
        +     'proxy_set_header Connection "Upgrade"; \n'
        +     'proxy_set_header X-Real-IP $remote_addr; \n'
        +     'proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \n'
        +     'proxy_set_header Host $http_host; \n'
        +     'proxy_set_header X-NginX-Proxy true; \n'
        +     'proxy_redirect off; \n'
        +     'proxy_buffering off; \n'
        +     `proxy_pass http://${opts.name}:${opts.port}; \n`
        +   '} \n'
        + '}';
  const confPath = path.join(configDir, opts.name + '.conf');

  fs.access(confPath, fs.constants.F_OK, (err) => {
    if (err) {
      fs.writeFile(confPath, config, (err) => {
        if (err) {
          return callback(err)
        }

        _check(function(checkErr) {
          if (checkErr) {
            fs.unlink(confPath, (err) => {
              if (err) {
                return callback(err);
              }

              callback(checkErr);
            });
          } else {
            _reload(callback);
          }
        });
      });
    }
  });
}

function remove(name, callback) {
  const confPath = path.join(configDir, name + '.conf');

  fs.access(confPath, fs.constants.F_OK, (err) => {
    if (err) {
      return callback();
    }

    fs.unlink(confPath, (err) => {
      if (err) {
        return callback();
      }

      _reload(callback);
    });
  });
}

function _reload(callback) {
  exec('nginx -s reload', callback);
}

function _check(callback) {
  exec('nginx -t', callback);
}

module.exports = {
  create,
  remove
}
