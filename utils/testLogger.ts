import { serverLogger, authLogger, dbLogger, appLogger } from "./logger";

// Simulating Server Startup
const testServerLogs = () => {
  serverLogger.info("Starting the server...", { userId: "system", requestId: "req-12345" });
  serverLogger.info("Server running on http://localhost:3000", { userId: "system", requestId: "req-12345" });
  serverLogger.warn("High memory usage detected!", { userId: "system", requestId: "req-12345", memoryUsage: "85%" });
  serverLogger.error("Server crashed unexpectedly!", { userId: "system", requestId: "req-12345", errorCode: "ERR_500" });
};

// Simulating Authentication Logs
const testAuthLogs = () => {
  authLogger.info("User 'john_doe' is attempting to log in.", { userId: "john_doe", requestId: "req-67890" });
  authLogger.warn("Suspicious login attempt detected from IP: 192.168.1.100", { userId: "john_doe", requestId: "req-67890", ipAddress: "192.168.1.100" });
  authLogger.info("User 'john_doe' successfully logged in.", { userId: "john_doe", requestId: "req-67890" });
  authLogger.error("User 'unknown_user' failed login due to invalid password.", { userId: "unknown_user", requestId: "req-67890", errorCode: "ERR_401" });
};

// Simulating Database Logs
const testDatabaseLogs = () => {
  dbLogger.info("Connecting to the database...", { userId: "system", requestId: "req-54321" });
  dbLogger.info("Database connected successfully.", { userId: "system", requestId: "req-54321" });
  dbLogger.debug("Executing query: SELECT * FROM users WHERE id=1", { userId: "system", requestId: "req-54321", query: "SELECT * FROM users WHERE id=1" });
  dbLogger.warn("Slow database query detected (Execution time: 2.5s)", { userId: "system", requestId: "req-54321", executionTime: "2.5s" });
  dbLogger.error("Database connection lost. Retrying...", { userId: "system", requestId: "req-54321", errorCode: "ERR_DB_CONN" });
};

// Simulating General Application Logs
const testApplicationLogs = () => {
  appLogger.info("Application started successfully.", { userId: "system", requestId: "req-98765" });
  appLogger.debug("Fetching user profile data...", { userId: "john_doe", requestId: "req-98765", action: "fetch_profile" });
  appLogger.warn("API rate limit nearing threshold.", { userId: "system", requestId: "req-98765", rateLimit: "90%" });
  appLogger.error("Unexpected error in processing payment request.", { userId: "john_doe", requestId: "req-98765", errorCode: "ERR_PAYMENT" });
};

// Run all test logs
const runTests = () => {
  console.log("\n====== Running Logger Tests ======\n");
  testServerLogs();
  testAuthLogs();
  testDatabaseLogs();
  testApplicationLogs();
  console.log("\n====== Logger Tests Completed ======\n");
};

// Execute test script
runTests();

// To run use the following commands:
// 1. npx tsc 
// 2. node dist/utils/testLogger.js
//
// npx tsc is used for converting ts to js