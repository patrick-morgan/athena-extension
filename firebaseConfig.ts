import { initializeApp } from "firebase/app";
import { getAnalytics, logEvent } from "firebase/analytics";
import { getAuth, User, onAuthStateChanged } from "firebase/auth";
import config from "./config";

const firebaseConfig = config;

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

let authStateInitialized = false;
let currentUser: User | null = null;

// Initialize the auth state
const initializeAuthState = (): Promise<void> => {
  return new Promise((resolve) => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      currentUser = user;
      authStateInitialized = true;
      if (user) {
        logEvent(analytics, "user_authenticated", { userId: user.uid });
      }
      unsubscribe();
      resolve();
    });
  });
};

export const signInWithChrome = (): Promise<User> => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "signIn" }, (response) => {
      if (chrome.runtime.lastError) {
        logEvent(analytics, "sign_in_error", {
          error: chrome.runtime.lastError.message,
        });
        reject(chrome.runtime.lastError);
      } else if (response.error) {
        logEvent(analytics, "sign_in_error", { error: response.error });
        reject(new Error(response.error));
      } else {
        currentUser = response.user;
        logEvent(analytics, "user_signed_in", { userId: response.user.uid });
        resolve(response.user);
      }
    });
  });
};

export const getCurrentUser = async (): Promise<User | null> => {
  if (!authStateInitialized) {
    await initializeAuthState();
  }
  return currentUser;
};

export const getIdToken = async (): Promise<string | null> => {
  const user = await getCurrentUser();
  if (user) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: "getIdToken" }, (response) => {
        if (chrome.runtime.lastError) {
          logEvent(analytics, "get_id_token_error", {
            error: chrome.runtime.lastError.message,
          });
          reject(chrome.runtime.lastError);
        } else if (response.error) {
          logEvent(analytics, "get_id_token_error", { error: response.error });
          reject(new Error(response.error));
        } else {
          resolve(response.token);
        }
      });
    });
  }
  return null;
};

export const signOut = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "signOut" }, (response) => {
      if (chrome.runtime.lastError) {
        logEvent(analytics, "sign_out_error", {
          error: chrome.runtime.lastError.message,
        });
        reject(chrome.runtime.lastError);
      } else if (response.error) {
        logEvent(analytics, "sign_out_error", { error: response.error });
        reject(new Error(response.error));
      } else {
        if (currentUser) {
          logEvent(analytics, "user_signed_out", { userId: currentUser.uid });
        }
        currentUser = null;
        resolve();
      }
    });
  });
};

// Utility function for logging events
export const logAnalyticsEvent = (eventName: string, eventParams?: object) => {
  logEvent(analytics, eventName, eventParams);
};

export default app;
