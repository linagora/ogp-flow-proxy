const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const configDir = '/etc/nginx/conf.d/';
const TEMPLATE = require('../../templates/stack-openpass.json');

function create(opts, callback) {
  const config = ''
        + 'server {\n'
        +   'listen 80; \n'
        +   `server_name ${opts.name}; \n`
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
        +     `proxy_pass http://${opts.upstream}:${opts.port}; \n`
        +   '} \n'
        + '}';
  const confPath = path.join(configDir, opts.upstream + '.conf');

  fs.access(confPath, fs.constants.F_OK, (err) => {
    if (err) {
      fs.writeFile(confPath, config, (err) => {
        if (err) {
          return callback(err);
        }

        _check(checkErr => {
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

function remove(domain, callback) {
  const upstream = domain + '_' + _.cloneDeep(TEMPLATE).Main;
  const confPath = path.join(configDir, upstream + '.conf');

  fs.access(confPath, fs.constants.F_OK, (err) => {
    if (err) {
      return callback(new Error('Application is not exist in revert proxy'));
    }

    fs.unlink(confPath, (err) => {
      if (err) {
        return callback(new Error('Can not remove application\'s configuration file from revert proxy'));
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
};
