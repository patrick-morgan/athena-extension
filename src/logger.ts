// A more aggressive logger that forces logs to appear

// Enable this flag during development
const DEBUG_MODE = true;

// Store logs in memory for debugging
const logHistory: { level: string; message: string; timestamp: string }[] = [];

// Maximum number of logs to keep in memory
const MAX_LOG_HISTORY = 100;

// Force console output by using the Function constructor
// This bypasses some of Chrome's console filtering
const forceConsoleOutput = (level: string, args: any[]) => {
  if (DEBUG_MODE) {
    try {
      // Convert objects to strings to ensure they're visible
      const stringArgs = args.map((arg) =>
        typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg)
      );

      // Create a timestamp
      const timestamp = new Date().toISOString();

      // Create a formatted message
      const message = stringArgs.join(" ");

      // Store in our history
      logHistory.unshift({ level, message, timestamp });

      // Trim history if needed
      if (logHistory.length > MAX_LOG_HISTORY) {
        logHistory.pop();
      }

      // Force output to console using Function constructor
      // This is a workaround that often works when normal console methods are suppressed
      const consoleScript = `console.${level}("[ATHENA ${timestamp}]", "${message.replace(
        /"/g,
        '\\"'
      )}");`;
      new Function(consoleScript)();

      // Also try the normal way
      const consoleMethod = console[level as keyof Console] as Function;
      consoleMethod(`[ATHENA ${timestamp}]`, ...args);

      // If we're in a content script, try to send to background
      if (
        typeof chrome !== "undefined" &&
        chrome.runtime &&
        chrome.runtime.sendMessage
      ) {
        chrome.runtime
          .sendMessage({
            type: "DEBUG_LOG",
            level,
            message,
            timestamp,
          })
          .catch(() => {});
      }
    } catch (e) {
      // Last resort - if all else fails, try one more direct approach
      console.error("Logger error:", e);
    }
  }
};

export const logger = {
  log: (...args: any[]) => forceConsoleOutput("log", args),
  error: (...args: any[]) => forceConsoleOutput("error", args),
  warn: (...args: any[]) => forceConsoleOutput("warn", args),

  // Get the log history (useful for displaying in UI)
  getHistory: () => [...logHistory],

  // Clear the log history
  clearHistory: () => {
    logHistory.length = 0;
  },
};

// Create a global access point for debugging from the console
if (DEBUG_MODE && typeof window !== "undefined") {
  (window as any).__athenaLogs = logger;
}
