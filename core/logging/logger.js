
// Import Winston logging library
import winston from "winston"


// Create reusable logger object for entire framework
const logger = winston.createLogger({

  // Set minimum log level
  // Only logs with this level or higher will print
  // Levels: error > warn > info > debug
  level: "info",

  
  // Define how logs should look
  format: winston.format.combine(

    // Add timestamp in every log
    winston.format.timestamp(),

    
    // Customize log message format
    winston.format.printf(({ level, message, timestamp }) => {

      // Final log structure
      // Example:
      // 2026-05-24T10:00:00.000Z [INFO] Browser launched
      return `${timestamp} [${level.toUpperCase()}] ${message}`;
    })
  ),

  
  // Define where logs should be stored/displayed
  transports: [

    // Print logs in terminal/console
    new winston.transports.Console(),

    
    // Save logs into file
    // Useful for CI/CD and debugging failures
    new winston.transports.File({

      // Log file location
      filename: "reports/execution.log"
    })
  ]
});


// Export logger so entire framework can use it
module.exports = logger;