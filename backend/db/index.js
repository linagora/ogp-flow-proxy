const mongoose = require('mongoose');
const pubsub = require('../pubsub');
const models = require('./models');
const config = require('../config');

mongoose.Promise = require('q').Promise;

function init() {
  mongoose.connect(config.mongodb.host);

  const db = mongoose.connection;

  db.on('error', console.error.bind(console, 'connection error:'));
  db.once('open', () => {
    pubsub.publish('mongodb:connected');
  });
}

module.exports = {
  init,
  models,
};
