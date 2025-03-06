import winston from "winston";
import path from "path";

// Set the log directory to the root of the project
const logDir = path.resolve(__dirname, "../../compose/logs");


const logFormat = winston.format.printf(({ level, message, timestamp, service, ...metadata }) => {
    return JSON.stringify({
      timestamp,
      level:level.toUpperCase(),
      service,
      message,
      ...metadata
    })
});

const consoleLogFormat = winston.format.printf(({ level, message, timestamp }) => {
  return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

const createLogger = (logFile: string, service: string) => {

    return winston.createLogger({
        level: "info", // Default level
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
            logFormat
        ),
        defaultMeta: { service },
        transports: [
            new winston.transports.Console({
              format: winston.format.combine(
                winston.format.timestamp(),
                consoleLogFormat
              ),
            }),
            new winston.transports.File({
              filename: path.join(logDir, logFile),
              level: "info",
            }),
            new winston.transports.File({
              filename: path.join(logDir, "error.log"),
              level: "error",
            })
          ],
    })
}

export const serverLogger = createLogger("server.log", "server");
export const authLogger = createLogger("auth.log", "auth");
export const dbLogger = createLogger("database.log", "database");
export const appLogger = createLogger("application.log", "application");