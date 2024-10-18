// background.js
import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithCredential,
} from "firebase/auth";
import config from "../../config";
// import { API_URL } from "@/api/axiosInstance";
import {
  analyzeJournalists,
  analyzePublication,
  quickParseArticle,
} from "@/api/api";

import axios from "axios";

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
  console.log("message", message);
  if (message.action === "getIdToken") {
    const user = auth.currentUser;
    if (user) {
      user
        .getIdToken(true)
        .then((token) => {
          sendResponse({ token });
        })
        .catch((error) => {
          sendResponse({ error: error.message });
        });
    } else {
      sendResponse({ error: "No user is signed in" });
    }
    return true; // Indicates that the response is sent asynchronously
  } else if (message.action === "signIn") {
    const manifest = chrome.runtime.getManifest();
    const clientId = manifest?.oauth2?.client_id ?? "";
    const scopes = manifest?.oauth2?.scopes ?? [];
    const redirectUri = chrome.identity.getRedirectURL();

    const authUrl = new URL("https://accounts.google.com/o/oauth2/auth");
    authUrl.searchParams.append("client_id", clientId);
    authUrl.searchParams.append("response_type", "token");
    authUrl.searchParams.append("redirect_uri", redirectUri);
    authUrl.searchParams.append("scope", scopes.join(" "));

    chrome.identity.launchWebAuthFlow(
      { url: authUrl.toString(), interactive: true },
      async (responseUrl) => {
        if (chrome.runtime.lastError) {
          sendResponse({ error: chrome.runtime.lastError.message });
          return;
        }

        const url = new URL(responseUrl);
        const params = new URLSearchParams(url.hash.slice(1));
        const accessToken = params.get("access_token");

        if (!accessToken) {
          sendResponse({ error: "Failed to get access token" });
          return;
        }

        try {
          const credential = GoogleAuthProvider.credential(null, accessToken);
          const userCredential = await signInWithCredential(auth, credential);
          const user = userCredential.user;
          console.info("Signed in user");
          sendResponse({ user });
        } catch (error) {
          sendResponse({ error: error.message });
        }
      }
    );
    return true; // Indicates that the response is sent asynchronously
  } else if (message.action === "signOut") {
    auth
      .signOut()
      .then(() => {
        console.info("Signing out removing user");
        sendResponse({ success: true });
      })
      .catch((error) => {
        sendResponse({ error: error.message });
      });
    return true; // Indicates that the response is sent asynchronously
  }
  // else if (message.action === "analyzeArticle") {
  //   analyzeArticle(message.url);
  //   sendResponse({ success: true });
  // } else if (message.action === "getAnalysisState") {
  //   const state = await getAnalysisState(message.url);
  //   sendResponse(state);
  // }
});

let currentUrl = "";

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === "complete" && tab.url !== currentUrl) {
    currentUrl = tab.url;
    if (isValidUrl(currentUrl)) {
      fetchAndStoreArticle(currentUrl);
    }
  }
});

function isValidUrl(url) {
  // Implement your URL validation logic here
  // For example, check if it's not a chrome:// URL, not a search page, etc.
  return true;
}

async function fetchAndStoreArticle(url) {
  try {
    console.log("fetching article by url", url);
    const response = await fetch(
      `${API_URL}/articles/by-url?url=${encodeURIComponent(url)}`
    );
    console.log("fetch by url", response.ok);
    if (response.ok) {
      // let journalistsAnalysis = [];
      const {
        article,
        publicationAnalysis,
        journalistsAnalysis,
        summary,
        political_bias_score,
        objectivity_score,
        // journalists,
      } = await response.json();
      // journalistsAnalysis =
      console.log("article", article);
      console.log("journalistsAnalysis", journalistsAnalysis);
      console.log("publicationAnalysis", publicationAnalysis);
      console.log("summary", summary);
      console.log("political_bias_score", political_bias_score);
      console.log("objectivity_score", objectivity_score);

      if (!article) return;

      // If not journalists.length, it didn't run, so quickly run it
      if (
        (article.article_authors.length && !journalistsAnalysis.length) ||
        (journalistsAnalysis.length &&
          article.article_authors.length > journalistsAnalysis.length)
      ) {
        console.log("Running journalist analysis on article", article.id);
        const journalistResponse = await axiosInstance.post(
          "/analyze-journalists",
          {
            articleId: article.id,
          }
        );
        console.log("journalist response", journalistResponse.data);
        journalistsAnalysis.length = 0;
        journalistResponse.data.forEach((j) => {
          journalistsAnalysis.push(j);
        });
        console.log("Journalist Analysis now:", journalistsAnalysis);
      }

      const publicationAnalysisDict = {};
      publicationAnalysisDict[publicationAnalysis.publication.id] =
        publicationAnalysis.analysis;

      const reducedArticle = {
        id: article.id,
        created_at: article.created_at,
        updated_at: article.updated_at,
        url: article.url,
        title: article.title,
        date_published: article.date_published,
        date_updated: article.date_updated,
        text: "",
        publication: article.publication,
        article_authors: article.article_authors,
      };

      chrome.storage.local.set({
        [encodeURIComponent(url)]: {
          ...reducedArticle,
          summary: summary,
          political_bias_score: political_bias_score,
          objectivity_score: objectivity_score,
        },
      });

      console.log(
        "setting publication",
        article.publication,
        publicationAnalysis
      );
      chrome.storage.local.set({
        [article.publication]: publicationAnalysis,
      });

      journalistsAnalysis?.forEach((journalist) => {
        console.log("setting journalist", journalist.journalist, journalist);

        if (!journalist?.journalist) return;
        chrome.storage.local.set({
          [journalist.journalist]: journalist,
        });
      });
    }
  } catch (error) {
    console.error("Error fetching article:", error);
  }
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (
    message.action === "startAnalysis" ||
    message.action === "restartAnalysis"
  ) {
    analyzeArticle(message.data);
    // sendResponse({ success: true });
    return false; // We're not using sendResponse
  } else if (message.action === "getAnalysisState") {
    getAnalysisState(message.url).then((state) => {
      if (chrome.runtime.lastError) {
        console.error("Error sending response:", chrome.runtime.lastError);
      } else {
        sendResponse(state);
      }
    });
    return true; // We will send a response asynchronously
  }
  // ... other message handlers ...
});
async function setAnalysisState(url, state) {
  await chrome.storage.local.set({
    [`analysis_state_${encodeURIComponent(url)}`]: state,
  });
}

async function getAnalysisState(url) {
  const result = await chrome.storage.local.get(
    `analysis_state_${encodeURIComponent(url)}`
  );
  return result[`analysis_state_${encodeURIComponent(url)}`] || null;
}

async function analyzeArticle(data) {
  const { url, hostname, head, body } = data;
  try {
    console.log("setting analysis state to in_progress");
    await setAnalysisState(url, { status: "in_progress" });

    console.log("we set, now start parse");

    // If it's a restart, we might want to clear any partial results
    if (data.restart) {
      await chrome.storage.local.remove(encodeURIComponent(url));
    }

    console.log("about to quick parse");

    const quickParseResp = await axiosInstance.post("/articles/quick-parse", {
      url,
      hostname,
      head,
      body,
    });

    const { article, summary, political_bias_score, objectivity_score } =
      quickParseResp.data;

    console.log("quickParseResp", quickParseResp.data);

    if (!quickParseResp.data) {
      throw new Error("Error quick parsing article");
    }

    const reducedArticle = {
      id: article.id,
      created_at: article.created_at,
      updated_at: article.updated_at,
      url: article.url,
      title: article.title,
      date_published: article.date_published,
      date_updated: article.date_updated,
      text: "",
      publication: article.publication,
      article_authors: article.article_authors,
    };

    console.log("setting reduced article", reducedArticle);

    chrome.storage.local.set({
      [encodeURIComponent(url)]: {
        ...reducedArticle,
        summary: summary,
        political_bias_score: political_bias_score,
        objectivity_score: objectivity_score,
      },
    });

    const [journalistsAnalysis, publicationAnalysis] = await Promise.all([
      axiosInstance.post("/analyze-journalists", {
        articleId: quickParseResp.data.article.id,
      }),
      axiosInstance.post("/analyze-publication", {
        publicationId: quickParseResp.data.publication.id,
      }),
    ]);

    console.log(
      "setting publication from quick parse",
      publicationAnalysis.data
    );

    await chrome.storage.local.set({
      [quickParseResp.data.publication.id]: publicationAnalysis.data,
    });

    console.log("journalists", journalistsAnalysis.data);
    for (const journalist of journalistsAnalysis.data) {
      console.log("setting", journalist.journalist, "to", journalist);
      await chrome.storage.local.set({
        [journalist.journalist]: journalist,
      });
    }

    console.log("setting analysis state to completed");
    await setAnalysisState(url, { status: "completed" });
  } catch (error) {
    console.error("Error analyzing article:", error);
    await setAnalysisState(url, { status: "error", message: error.message });
  }
}

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
