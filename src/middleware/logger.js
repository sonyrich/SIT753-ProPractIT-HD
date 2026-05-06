const winston = require('winston');
const path = require('node:path');

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ level, message, timestamp }) =>
          `${String(timestamp)} [${level}]: ${String(message)}`
        )
      )
    }),
    new winston.transports.File({
      filename: path.join('logs', 'error.log'),
      level: 'error',
      handleExceptions: true
    }),
    new winston.transports.File({
      filename: path.join('logs', 'app.log')
    })
  ]
});

module.exports = logger;