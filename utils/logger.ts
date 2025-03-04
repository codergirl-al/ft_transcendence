import winston from "winston";
import path from "path";

// Set the log directory to the root of the project
const logDir1 = path.resolve(__dirname, "../../compose/filebeat_ingest_data");
const logDir2 = path.resolve(__dirname, "../../compose/logstash_ingest_data");


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
              filename: path.join(logDir1, logFile),
              level: "info",
            }),
            new winston.transports.File({
              filename: path.join(logDir1, "error.log"),
              level: "error",
            }),
            new winston.transports.File({
              filename: path.join(logDir2, logFile),
              level: "info",
            }),
            new winston.transports.File({
              filename: path.join(logDir2, "error.log"),
              level: "error",
            }),
          ],
    })
}

export const serverLogger = createLogger("server.log");
export const authLogger = createLogger("auth.log");
export const dbLogger = createLogger("database.log");
export const appLogger = createLogger("application.log");