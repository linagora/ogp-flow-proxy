const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');
const _ = require('lodash');

const configDir = '/etc/nginx/conf.d/';
const TEMPLATE = require('../../templates/stack-openpass.json');

function create(opts, callback) {
  const config = `
      server {
        listen         80;
        server_name    ${opts.name};
        return         301 https://$server_name$request_uri;
      }
      server {
        listen 443 ssl;
        ssl_certificate /etc/nginx/conf.d/nginx.crt;
        ssl_certificate_key /etc/nginx/conf.d/nginx.key;
        server_name ${opts.name};
          location / {
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "Upgrade";
            proxy_set_header X-Real-IP $remote_addr;
            proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
            proxy_set_header Host $http_host;
            proxy_set_header X-NginX-Proxy true;
            proxy_redirect off;
            proxy_buffering off;
            proxy_pass http://${opts.upstream}:${opts.port};
          }
        }`;
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
