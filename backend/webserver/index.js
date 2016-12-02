const express = require('express');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const deploymentRoute = require('./api/deployment');

const app = express();

app.use(bodyParser.json());
app.use(morgan('dev'));

app.get('/', (req, res) => {
  res.send('Welcome to Flow proxy');
});

app.use('/api/deployments', deploymentRoute);

function start() {
  app.listen(8080, () => {
    console.log('Flow-proxy server is listening on port 8080!');
  });
}

module.exports = {
  start,
};
