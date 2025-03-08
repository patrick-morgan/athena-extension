import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  sendEmailVerification,
  User,
} from "firebase/auth";
import config from "./config";

const firebaseConfig = config;
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);

// Disable reCAPTCHA verification
auth.settings.appVerificationDisabledForTesting = true;

export const signUpWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    // Send verification email immediately after sign up
    await sendEmailVerification(userCredential.user);
    return userCredential.user;
  } catch (error) {
    // logEvent("sign_up_error", { error: (error as Error).message });
    throw error;
  }
};

export const signInWithEmail = async (
  email: string,
  password: string
): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    return userCredential.user;
  } catch (error) {
    // logEvent("sign_in_error", { error: (error as Error).message });
    throw error;
  }
};

export const signOut = async (): Promise<void> => {
  try {
    await firebaseSignOut(auth);
  } catch (error) {
    // logEvent("sign_out_error", { error: (error as Error).message });
    throw error;
  }
};

export const getCurrentUser = (): Promise<User | null> => {
  return new Promise((resolve) => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      unsubscribe();
      resolve(user);
    });
  });
};

export const getIdToken = async (): Promise<string | null> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      return null;
    }
    return await currentUser.getIdToken();
  } catch (error) {
    console.error("Error getting ID token:", error);
    return null;
  }
};

export const resetPassword = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    // logEvent("password_reset_error", { error: (error as Error).message });
    throw error;
  }
};

// Add a new function to resend verification email
export const resendVerificationEmail = async (user: User): Promise<void> => {
  try {
    await sendEmailVerification(user);
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw error;
  }
};

export default app;
