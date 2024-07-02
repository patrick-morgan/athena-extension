const doc = document.documentElement.outerHTML;
console.log("the doc", doc);

console.log("RUNNING CONTENT SCRIPT");

chrome.runtime.sendMessage({
  action: "articleContent",
  content: { html: doc, url: window.location.href },
});

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (message.action === "requestContent") {
//     console.log("Requesting content again");
//     sendResponse({ html: document.documentElement.outerHTML });
//   }
//   return true; // Indicates you wish to send a response asynchronously
// });

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "requestContent") {
    console.log("Requesting content again");
    sendResponse({
      html: document.documentElement.outerHTML,
      url: window.location.href,
    });
  }
  return true; // Indicates you wish to send a response asynchronously
});
