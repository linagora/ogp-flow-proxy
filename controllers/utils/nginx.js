'use strict';

const nginxVhosts = require('nginx-vhosts');

const NGINX_CONFIG_FILE_PATH = '/etc/nginx/nginx.conf';
const vhosts = new nginxVhosts();

function create(opts, callback) {
  opts.config = ''
        + 'server {\n'
        +   'listen 80; \n'
        +   `server_name ${opts.name}.${opts.domain}; \n`
        +   'location / { \n'
        +     `proxy_pass http://${opts.name}:${opts.port}; \n`
        +     'proxy_set_header X-Forwarded-For $remote_addr;\n'
        +     'proxy_buffering off;\n'
        +   '} \n'
        + '}'

  vhosts.write(opts, callback);
}

function remove(name, callback) {
  vhost.remove(name, callback);
}

module.exports = {
  create,
  remove
}
