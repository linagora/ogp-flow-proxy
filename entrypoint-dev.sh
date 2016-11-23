#!/bin/sh
/etc/init.d/nginx start
export NODE_ENV="development"
npm install nodemon -g
npm install && nodemon server.js

