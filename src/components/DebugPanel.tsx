import React, { useState, useEffect } from "react";
import { logger } from "../logger";

export const DebugPanel: React.FC = () => {
  const [logs, setLogs] = useState<
    { level: string; message: string; timestamp: string }[]
  >([]);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch logs from memory and chrome.storage
  const refreshLogs = async () => {
    // Get in-memory logs
    const memoryLogs = logger.getHistory();

    // Try to get logs from background
    if (
      typeof chrome !== "undefined" &&
      chrome.runtime &&
      chrome.runtime.sendMessage
    ) {
      try {
        chrome.runtime.sendMessage({ type: "GET_DEBUG_LOGS" }, (response) => {
          if (response && response.logs) {
            // Combine and deduplicate logs
            const allLogs = [...memoryLogs, ...response.logs];
            const uniqueLogs = allLogs.filter(
              (log, index, self) =>
                index ===
                self.findIndex(
                  (l) =>
                    l.timestamp === log.timestamp && l.message === log.message
                )
            );

            // Sort by timestamp (newest first)
            uniqueLogs.sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime()
            );

            setLogs(uniqueLogs);
          } else {
            setLogs(memoryLogs);
          }
        });
      } catch (e) {
        setLogs(memoryLogs);
      }
    } else {
      setLogs(memoryLogs);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshLogs();
      const interval = setInterval(refreshLogs, 2000);
      return () => clearInterval(interval);
    }
  }, [isOpen]);

  // Test logging
  const testLog = () => {
    logger.log("Test log message", { time: new Date().toISOString() });
    logger.warn("Test warning message");
    logger.error("Test error message");
    setTimeout(refreshLogs, 500);
  };

  if (!isOpen) {
    return (
      <div
        style={{
          position: "fixed",
          bottom: "10px",
          right: "10px",
          background: "#333",
          color: "white",
          padding: "5px 10px",
          borderRadius: "5px",
          cursor: "pointer",
          zIndex: 9999,
        }}
        onClick={() => setIsOpen(true)}
      >
        Debug
      </div>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "10px",
        right: "10px",
        width: "80%",
        maxWidth: "600px",
        height: "400px",
        background: "#222",
        color: "white",
        borderRadius: "5px",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          padding: "10px",
          background: "#333",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <span>Debug Console ({logs.length} logs)</span>
        <div>
          <button
            style={{
              marginRight: "10px",
              padding: "2px 8px",
              background: "#555",
              border: "none",
              color: "white",
              borderRadius: "3px",
            }}
            onClick={testLog}
          >
            Test Log
          </button>
          <button
            style={{
              marginRight: "10px",
              padding: "2px 8px",
              background: "#555",
              border: "none",
              color: "white",
              borderRadius: "3px",
            }}
            onClick={refreshLogs}
          >
            Refresh
          </button>
          <button
            style={{
              padding: "2px 8px",
              background: "#555",
              border: "none",
              color: "white",
              borderRadius: "3px",
            }}
            onClick={() => setIsOpen(false)}
          >
            Close
          </button>
        </div>
      </div>
      <div style={{ flex: 1, overflow: "auto", padding: "10px" }}>
        {logs.length === 0 ? (
          <div
            style={{ color: "#888", textAlign: "center", marginTop: "20px" }}
          >
            No logs yet. Try the "Test Log" button.
          </div>
        ) : (
          logs.map((log, index) => (
            <div
              key={index}
              style={{
                marginBottom: "8px",
                padding: "5px",
                borderRadius: "3px",
                background:
                  log.level === "error"
                    ? "#5a1e1e"
                    : log.level === "warn"
                    ? "#5a4e1e"
                    : "#1e3a5a",
                fontFamily: "monospace",
                fontSize: "12px",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
              }}
            >
              <div
                style={{ color: "#aaa", fontSize: "10px", marginBottom: "3px" }}
              >
                {new Date(log.timestamp).toLocaleTimeString()}
              </div>
              {log.message}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
