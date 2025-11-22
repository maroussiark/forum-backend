import winston from "winston";
import path from "path";

const logDir = path.join(process.cwd(), "logs");

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({
      level: "debug",
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.simple()
      )
    }),

    new winston.transports.File({
      filename: path.join(logDir, "error.log"),
      level: "error"
    }),

    new winston.transports.File({
      filename: path.join(logDir, "combined.log")
    })
  ]
});

export default logger;
