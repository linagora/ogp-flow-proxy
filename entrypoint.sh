#!/bin/sh
/etc/init.d/nginx start
npm install --production && npm start
