const webserver = require('./webserver');
const pubsub = require('./pubsub');
const db = require('./db');

db.init();
pubsub.subscribe('mongodb:connected', webserver.start);
