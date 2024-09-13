const fs = require("fs");
const path = require("path");

const configTemplate = fs.readFileSync(
  path.resolve(__dirname, "config.template.js"),
  "utf8"
);

const configContent = configTemplate
  .replace("FIREBASE_API_KEY", process.env.FIREBASE_API_KEY || "")
  .replace("FIREBASE_AUTH_DOMAIN", process.env.FIREBASE_AUTH_DOMAIN || "")
  .replace("FIREBASE_PROJECT_ID", process.env.FIREBASE_PROJECT_ID || "")
  .replace("FIREBASE_STORAGE_BUCKET", process.env.FIREBASE_STORAGE_BUCKET || "")
  .replace(
    "FIREBASE_MESSAGING_SENDER_ID",
    process.env.FIREBASE_MESSAGING_SENDER_ID || ""
  )
  .replace("FIREBASE_APP_ID", process.env.FIREBASE_APP_ID || "");

fs.writeFileSync(path.resolve(__dirname, "config.js"), configContent);

console.log("Config file generated successfully.");
