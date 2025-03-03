import { serverLogger, authLogger, dbLogger, appLogger } from "./logger";

// Simulating Server Startup
const testServerLogs = () => {
  serverLogger.info("Starting the server...");
  serverLogger.info("Server running on http://localhost:3000");
  serverLogger.warn("High memory usage detected!");
  serverLogger.error("Server crashed unexpectedly!");
};

// Simulating Authentication Logs
const testAuthLogs = () => {
  authLogger.info("User 'john_doe' is attempting to log in.");
  authLogger.warn("Suspicious login attempt detected from IP: 192.168.1.100");
  authLogger.info("User 'john_doe' successfully logged in.");
  authLogger.error("User 'unknown_user' failed login due to invalid password.");
};

// Simulating Database Logs
const testDatabaseLogs = () => {
  dbLogger.info("Connecting to the database...");
  dbLogger.info("Database connected successfully.");
  dbLogger.debug("Executing query: SELECT * FROM users WHERE id=1");
  dbLogger.warn("Slow database query detected (Execution time: 2.5s)");
  dbLogger.error("Database connection lost. Retrying...");
};

// Simulating General Application Logs
const testApplicationLogs = () => {
  appLogger.info("Application started successfully.");
  appLogger.debug("Fetching user profile data...");
  appLogger.warn("API rate limit nearing threshold.");
  appLogger.error("Unexpected error in processing payment request.");
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
// npx tsc is used for converiting ts to js
