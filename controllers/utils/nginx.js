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
        +     `proxy_pass http://${opts.name}:${opts.port}; \n`
        +     'proxy_set_header X-Forwarded-For $remote_addr;\n'
        +     'proxy_buffering off;\n'
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
