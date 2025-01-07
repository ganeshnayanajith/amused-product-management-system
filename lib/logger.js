const pino = require('pino');
const { PINO_LOG_LEVEL } = require('../secret-configs');

const logger = pino({
  level: PINO_LOG_LEVEL || 'trace',
  timestamp: () => `,"timestamp":"${new Date(Date.now()).toISOString()}"`,
  formatters: {
    level: (label) => {
      return { level: label.toUpperCase() };
    },
  }
});

module.exports = logger;
