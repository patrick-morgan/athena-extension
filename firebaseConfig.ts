import { initializeApp } from "firebase/app";
import { getAuth, User } from "firebase/auth";
import config from "./config";

const firebaseConfig = config;

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

export const signInWithChrome = (): Promise<User> => {
  return new Promise((resolve, reject) => {
    chrome.runtime.sendMessage({ action: "signIn" }, (response) => {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else if (response.error) {
        reject(new Error(response.error));
      } else {
        resolve(response.user);
      }
    });
  });
};

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(["user"], (result) => {
      if (result.user) {
        resolve(JSON.parse(result.user));
      } else {
        resolve(null);
      }
    });
  });
};

export const getIdToken = async (): Promise<string | null> => {
  const user = await getCurrentUser();
  if (user) {
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ action: "getIdToken" }, (response) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else if (response.error) {
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
        resolve();
      }
    });
  });
};

export default app;
