import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInWithCredential,
  GoogleAuthProvider,
} from "firebase/auth";
import config from "./config";

const firebaseConfig = config;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export const signInWithChrome = (): Promise<void> => {
  return new Promise((resolve, reject) => {
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
      (responseUrl) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
          return;
        }

        const url = new URL(responseUrl!);
        const params = new URLSearchParams(url.hash.slice(1));
        const accessToken = params.get("access_token");

        if (!accessToken) {
          reject(new Error("Failed to get access token"));
          return;
        }

        const credential = GoogleAuthProvider.credential(null, accessToken);
        signInWithCredential(auth, credential)
          .then(() => resolve())
          .catch(reject);
      }
    );
  });
};

export default app;
