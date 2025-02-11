import path from "node:path";
import envSchema from "env-schema";

const schema = {
  type: "object",
  required: ["PORT", "LOG_LEVEL", "NODE_ENV", "DB_FILE"],
  properties: {
    PORT: {
      type: "number",
      default: 3000,
    },
    LOG_LEVEL: {
      type: "string",
      default: "info",
    },
    NODE_ENV: {
      type: "string",
      default: "development",
      enum: ["development", "testing", "production", "staging"],
    },
    DB_FILE: {
      type: "string",
      default: "./blog.db",
    },
  },
};

const config = envSchema({
  schema: schema,
  dotenv: {
    path: path.join(import.meta.dirname, "../../.env"),
  },
});

const envConfig = {
  port: config.PORT,
  logLevel: config.LOG_LEVEL,
  nodeEnv: config.NODE_ENV,
  dbFile: config.DB_FILE,
};

export default envConfig;
