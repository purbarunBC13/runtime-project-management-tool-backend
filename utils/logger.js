import { createLogger, format, transports } from "winston";
import dotenv from "dotenv";

dotenv.config();

const logFormat = format.combine(
  format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
  format.printf(({ level, message, timestamp, ...metadata }) => {
    let logMessage = `${timestamp} [${level.toUpperCase()}]: `;

    if (typeof message === "string") {
      logMessage += message;
    } else {
      logMessage += JSON.stringify(message, null, 2); // Serialize JSON objects with indentation
    }

    if (Object.keys(metadata).length) {
      logMessage += ` ${JSON.stringify(metadata)}`; // Log additional metadata
    }

    return logMessage;
  })
);

const transportsList = [
  new transports.File({ filename: "logs/error.log", level: "error" }),
  new transports.File({ filename: "logs/combined.log" }),
];

if (process.env.NODE_ENV === "development") {
  transportsList.push(
    new transports.Console({
      format: format.combine(
        format.colorize(),
        format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        format.printf(({ level, message, timestamp, ...metadata }) => {
          let logMessage = `${timestamp} [${level}]: `;

          if (typeof message === "string") {
            logMessage += message;
          } else {
            logMessage += JSON.stringify(message, null, 2);
          }

          if (Object.keys(metadata).length) {
            logMessage += ` ${JSON.stringify(metadata)}`;
          }

          return logMessage;
        })
      ),
    })
  );
}

const logger = createLogger({
  level: "info",
  format: logFormat,
  transports: transportsList,
});

export { logger };
