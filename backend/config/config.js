const MONGO_HOST = process.env.MONGO_HOST || 'localhost';
const MONGO_PORT = process.env.MONGO_PORT || 27017;
const MONGO_DBNAME = process.env.MONGO_DBNAME || 'flow-proxy';
const SERVER_IP = process.env.SERVER_IP || '127.0.0.1';

module.exports = {
  mongodb: {
    host: `mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DBNAME}`
  },
  SERVER_IP
};
