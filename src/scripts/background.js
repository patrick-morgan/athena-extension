// background.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import config from "../../config";
import axios from "axios";

// export const API_URL =
//   process.env.NODE_ENV === "production"
//     ? process.env.EXPRESS_API_URL
//     : "http://localhost:3000";

export const API_URL = "http://localhost:3000";

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

axiosInstance.interceptors.request.use(
  async (config) => {
    return new Promise((resolve) => {
      chrome.storage.local.get("idToken", (result) => {
        if (result.idToken) {
          config.headers.Authorization = `Bearer ${result.idToken}`;
        }
        resolve(config);
      });
    });
  },
  (error) => {
    return Promise.reject(error);
  }
);

const firebaseConfig = config;
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// Disable reCAPTCHA verification
auth.settings.appVerificationDisabledForTesting = true;

// Check if chrome is defined before using it
if (typeof chrome !== "undefined" && chrome.runtime) {
  chrome.runtime.onMessageExternal.addListener(function (
    request,
    sender,
    sendResponse
  ) {
    if (request.type === "STRIPE_REDIRECT") {
      handleStripeRedirect(request.status);
      sendResponse({ received: true });
    }
  });

  chrome.runtime.onStartup.addListener(function () {
    chrome.storage.local.get(["stripeRedirectStatus"], function (result) {
      if (result.stripeRedirectStatus) {
        handleStripeRedirect(result.stripeRedirectStatus);
        chrome.storage.local.remove("stripeRedirectStatus");
      }
    });
  });
}

function handleStripeRedirect(status) {
  if (status === "success") {
    // Handle successful payment
    console.log("Payment successful");
    // Update UI or state as needed
  } else if (status === "cancel") {
    // Handle cancelled payment
    console.log("Payment cancelled");
    // Update UI or state as needed
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startQuickParse") {
    quickParseArticle(message.data);
    return true;
  } else if (message.action === "startDetailedAnalysis") {
    detailedAnalysis(message.data);
    return true;
  } else if (message.action === "getQuickParseState") {
    getQuickParseState(message.url).then(sendResponse);
    return true;
  } else if (message.action === "getDetailedAnalysisState") {
    getDetailedAnalysisState(message.url).then(sendResponse);
    return true;
  }
  // ... other message handlers ...
});

async function quickParseArticle(data) {
  const { url, hostname, head, body, restart } = data;
  try {
    await setQuickParseState(url, { status: "in_progress" });

    // If it's a restart, we might want to clear any partial results
    if (restart) {
      await chrome.storage.local.remove([
        encodeURIComponent(url),
        `${encodeURIComponent(url)}_detailed`,
      ]);
    }

    const quickParseResp = await axiosInstance.post("/articles/quick-parse", {
      url,
      hostname,
      head,
      body,
    });

    const { article, summary, political_bias_score, objectivity_score } =
      quickParseResp.data;

    if (!quickParseResp.data) {
      throw new Error("Error quick parsing article");
    }

    console.log("quicik parse response fish nman", article);

    const reducedArticle = {
      id: article.id,
      created_at: article.created_at,
      updated_at: article.updated_at,
      url: article.url,
      title: article.title,
      date_published: article.date_published,
      date_updated: article.date_updated,
      text: "",
      publication: article.publicationObject,
      article_authors: article.article_authors,
    };

    await chrome.storage.local.set({
      [encodeURIComponent(url)]: {
        ...reducedArticle,
        summary: summary,
        political_bias_score: political_bias_score,
        objectivity_score: objectivity_score,
      },
    });

    await setQuickParseState(url, { status: "completed" });
  } catch (error) {
    console.error("Error in quick parse:", error);
    await setQuickParseState(url, { status: "error", message: error.message });
  }
}

async function detailedAnalysis(data) {
  const { url } = data;
  try {
    await setDetailedAnalysisState(url, { status: "in_progress" });

    const storedData = await chrome.storage.local.get(encodeURIComponent(url));
    const article = storedData[encodeURIComponent(url)];
    console.log("stored data for analysis", storedData);
    console.log("article", article);

    const [journalistsAnalysis, publicationAnalysis] = await Promise.all([
      axiosInstance.post("/analyze-journalists", {
        articleId: article.id,
      }),
      axiosInstance.post("/analyze-publication", {
        publicationId: article.publication.id,
      }),
    ]);
    console.log("journalAnalysis", journalistsAnalysis.data);
    console.log("pubanalysis", publicationAnalysis.data);

    await chrome.storage.local.set({
      [`${encodeURIComponent(url)}_detailed`]: {
        journalistsAnalysis: journalistsAnalysis.data,
        publicationAnalysis: publicationAnalysis.data,
      },
    });

    await setDetailedAnalysisState(url, { status: "completed" });
  } catch (error) {
    console.error("Error in detailed analysis:", error);
    await setDetailedAnalysisState(url, {
      status: "error",
      message: error.message,
    });
  }
}

async function setQuickParseState(url, state) {
  await chrome.storage.local.set({
    [`quick_parse_state_${encodeURIComponent(url)}`]: state,
  });
}

async function getQuickParseState(url) {
  const result = await chrome.storage.local.get(
    `quick_parse_state_${encodeURIComponent(url)}`
  );
  return result[`quick_parse_state_${encodeURIComponent(url)}`] || null;
}

async function setDetailedAnalysisState(url, state) {
  await chrome.storage.local.set({
    [`detailed_analysis_state_${encodeURIComponent(url)}`]: state,
  });
}

async function getDetailedAnalysisState(url) {
  const result = await chrome.storage.local.get(
    `detailed_analysis_state_${encodeURIComponent(url)}`
  );
  return result[`detailed_analysis_state_${encodeURIComponent(url)}`] || null;
}

// chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
//   if (
//     message.action === "startAnalysis" ||
//     message.action === "restartAnalysis"
//   ) {
//     analyzeArticle(message.data);
//     // sendResponse({ success: true });
//     return false; // We're not using sendResponse
//   } else if (message.action === "getAnalysisState") {
//     getAnalysisState(message.url).then((state) => {
//       if (chrome.runtime.lastError) {
//         console.error("Error sending response:", chrome.runtime.lastError);
//       } else {
//         sendResponse(state);
//       }
//     });
//     return true; // We will send a response asynchronously
//   }
//   // ... other message handlers ...
// });
// async function setAnalysisState(url, state) {
//   await chrome.storage.local.set({
//     [`analysis_state_${encodeURIComponent(url)}`]: state,
//   });
// }

// async function getAnalysisState(url) {
//   const result = await chrome.storage.local.get(
//     `analysis_state_${encodeURIComponent(url)}`
//   );
//   return result[`analysis_state_${encodeURIComponent(url)}`] || null;
// }

// async function analyzeArticle(data) {
//   const { url, hostname, head, body } = data;
//   try {
//     console.log("setting analysis state to in_progress");
//     await setAnalysisState(url, { status: "in_progress" });

//     console.log("we set, now start parse");

//     // If it's a restart, we might want to clear any partial results
//     if (data.restart) {
//       await chrome.storage.local.remove(encodeURIComponent(url));
//     }

//     console.log("about to quick parse");

//     const quickParseResp = await axiosInstance.post("/articles/quick-parse", {
//       url,
//       hostname,
//       head,
//       body,
//     });

//     const { article, summary, political_bias_score, objectivity_score } =
//       quickParseResp.data;

//     console.log("quickParseResp", quickParseResp.data);

//     if (!quickParseResp.data) {
//       throw new Error("Error quick parsing article");
//     }

//     const reducedArticle = {
//       id: article.id,
//       created_at: article.created_at,
//       updated_at: article.updated_at,
//       url: article.url,
//       title: article.title,
//       date_published: article.date_published,
//       date_updated: article.date_updated,
//       text: "",
//       publication: article.publication,
//       article_authors: article.article_authors,
//     };

//     chrome.storage.local.set({
//       [encodeURIComponent(url)]: {
//         ...reducedArticle,
//         summary: summary,
//         political_bias_score: political_bias_score,
//         objectivity_score: objectivity_score,
//       },
//     });

//     const [journalistsAnalysis, publicationAnalysis] = await Promise.all([
//       axiosInstance.post("/analyze-journalists", {
//         articleId: quickParseResp.data.article.id,
//       }),
//       axiosInstance.post("/analyze-publication", {
//         publicationId: quickParseResp.data.publication.id,
//       }),
//     ]);

//     console.log(
//       "setting publication from quick parse",
//       publicationAnalysis.data
//     );

//     await chrome.storage.local.set({
//       [quickParseResp.data.publication.id]: publicationAnalysis.data,
//     });

//     console.log("journalists", journalistsAnalysis.data);
//     for (const journalist of journalistsAnalysis.data) {
//       console.log("setting", journalist.journalist, "to", journalist);
//       await chrome.storage.local.set({
//         [journalist.journalist]: journalist,
//       });
//     }

//     console.log("setting analysis state to completed");
//     await setAnalysisState(url, { status: "completed" });
//   } catch (error) {
//     console.error("Error analyzing article:", error);
//     await setAnalysisState(url, { status: "error", message: error.message });
//   }
// }

// Add this function to handle token updates
function updateIdToken(token) {
  chrome.storage.local.set({ idToken: token });
}

// Update the message listener to handle token updates
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "updateIdToken") {
    updateIdToken(message.token);
    sendResponse({ success: true });
  }
  // ... other message handlers ...
});
