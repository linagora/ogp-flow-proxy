const MONGO_HOST = process.env.MONGO_HOST || 'localhost';
const MONGO_PORT = process.env.MONGO_PORT || 27017;
const MONGO_DBNAME = process.env.MONGO_DBNAME || 'flow-proxy';

module.exports = {
  mongodb: {
    host: `mongodb://${MONGO_HOST}:${MONGO_PORT}/${MONGO_DBNAME}`
  }
};
