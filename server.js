'use strict';

const express = require('express');
const morgan = require('morgan');
const controller = require('./controllers/controller');
const PORT = 8080;
const app = express();

app.use(morgan('dev'));

app.get('/', function(req, res) {
  res.send('Welcome to Flow proxy');
});

app.post('/create', controller.create);

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);
