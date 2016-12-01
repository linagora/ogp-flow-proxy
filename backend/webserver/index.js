'use strict';

const express = require('express');
const morgan = require('morgan');
const deploymentRoute = require('./api/deployment');
const PORT = 8080;
const app = express();

app.use(morgan('dev'));

app.get('/', function(req, res) {
  res.send('Welcome to Flow proxy');
});

app.use('/api/deployments', deploymentRoute);

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);
