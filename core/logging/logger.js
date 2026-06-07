import winston from "winston";

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.printf(({ level, message, timestamp }) => {
      return `${timestamp} [${level.toUpperCase()}] ${message}`;
    })
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "reports/execution.log" })
  ]
});

/**
 * @param {string} level - Winston log level (error, warn, info, debug, silly)
 */
export function setLogLevel(level) {
  logger.level = level;
}

export default logger;
