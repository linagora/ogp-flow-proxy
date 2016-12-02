function getConfig(filepath) {
  try {
    return require(filepath);
  } catch (e) {
    return false;
  }
}

module.exports = getConfig('./config.production.js') || getConfig('./config.dev.js') || getConfig('./config.js');
