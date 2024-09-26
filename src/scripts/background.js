// background.js
import { initializeApp } from "firebase/app";
import {
  GoogleAuthProvider,
  getAuth,
  signInWithCredential,
} from "firebase/auth";
import config from "../../config";

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
});
