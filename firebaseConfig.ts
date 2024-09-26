import { initializeApp } from "firebase/app";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import config from "./config";
import { logEvent } from "./analytics";

const firebaseConfig = config;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

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
        logEvent("user_authenticated", { user_id: user.uid });
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
        reject(chrome.runtime.lastError);
      } else if (response.error) {
        reject(new Error(response.error));
      } else {
        currentUser = response.user;
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
          logEvent("get_id_token_error", {
            error: chrome.runtime.lastError.message,
          });
          reject(chrome.runtime.lastError);
        } else if (response.error) {
          logEvent("get_id_token_error", {
            error: response.error,
          });
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
        reject(chrome.runtime.lastError);
      } else if (response.error) {
        reject(new Error(response.error));
      } else {
        currentUser = null;
        resolve();
      }
    });
  });
};

export default app;
