// File: src/analytics.js

const MEASUREMENT_ID = "G-0PC4Z21KBC";

function sendToGA(type, params = {}) {
  const baseParams = {
    v: "2",
    tid: MEASUREMENT_ID,
    cid: getCID(),
  };

  const url = new URL("https://www.google-analytics.com/g/collect");
  const searchParams = new URLSearchParams({
    ...baseParams,
    ...params,
    t: type,
  });

  fetch(url.toString(), {
    method: "POST",
    body: searchParams.toString(),
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
  }).catch((error) => console.error("Error sending analytics:", error));
}

function getCID() {
  let cid = localStorage.getItem("ga_client_id");
  if (!cid) {
    cid = Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem("ga_client_id", cid);
  }
  return cid;
}

export function logEvent(eventName, eventParams = {}) {
  sendToGA("event", {
    en: eventName,
    ...Object.entries(eventParams).reduce((acc, [key, value]) => {
      acc[`ep.${key}`] = value;
      return acc;
    }, {}),
  });
}

export function logPageView(pagePath) {
  sendToGA("pageview", { dp: pagePath });
}
