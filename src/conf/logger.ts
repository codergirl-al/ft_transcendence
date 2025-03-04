import winston from "winston";
import path from "path";

// Set the log directory to the root of the project
const logDir = path.resolve(__dirname, "../../logs");


const logFormat = winston.format.printf(({ level, message, timestamp }) => {
    return `${timestamp} [${level.toUpperCase()}]: ${message}`;
});

const createLogger = (logFile: string) => {

    return winston.createLogger({
        level: "info", // Default level
        format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
            logFormat
        ),
        transports: [
            new winston.transports.Console({
              format: winston.format.combine(
                winston.format.timestamp(),
                logFormat
              ),
            }),
            new winston.transports.File({
              filename: path.join(logDir, logFile),
              level: "info",
            }),
            new winston.transports.File({
              filename: path.join(logDir, "error.log"),
              level: "error",
            }),
          ],
    })
}

export const serverLogger = createLogger("server.log");
export const authLogger = createLogger("auth.log");
export const dbLogger = createLogger("database.log");
export const appLogger = createLogger("application.log");