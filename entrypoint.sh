#!/bin/sh

openssl req -subj "/C=FR/ST=Paris/L=Paris/O=Linagora Ltd/CN=*.beta.data.gouv.fr" -x509 -nodes -days 365 -newkey rsa:2048 -keyout /etc/nginx/conf.d/nginx.key -out /etc/nginx/conf.d/nginx.crt

/etc/init.d/nginx start
npm start
