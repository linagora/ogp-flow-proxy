'use strict';

const fs = require('fs');
const NGINX_CONFIG_FILE_PATH = '/etc/nginx/nginx.conf';

function create() {
  fs.open('/');
}

function update() {

}

function destroy() {

}


function reload() {

}

module.exports = {
  create,
  update,
  destroy,
  reload
}
