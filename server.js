'use strict';

const express = require('express');
const controller = require('./controllers/controller');

// Constants
 const PORT = 8080;

// App
const app = express();
app.get('/', function(req, res) {
  res.send('Welcome to Flow proxy');
});

app.post('/create', controller.create);

app.listen(PORT);
console.log('Running on http://localhost:' + PORT);
