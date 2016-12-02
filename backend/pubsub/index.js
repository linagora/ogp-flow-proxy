const EventEmitter = require('events');

const eventBus = new EventEmitter();

function publish(topic, data) {
  eventBus.emit(topic, data);
}

function subscribe(topic, callback) {
  eventBus.on(topic, callback);
}

function once(topic, callback) {
  eventBus.once(topic, callback);
}

module.exports = {
  publish,
  subscribe,
  once,
};
