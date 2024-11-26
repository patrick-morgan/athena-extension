import { User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  signInWithEmail,
  signUpWithEmail,
  signOut,
} from "../firebaseConfig";
import { checkSubscription } from "./api/stripe";

interface AuthContextType {
  user: User | null;
  isSubscribed: boolean;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  checkSubscriptionStatus: (user: User | null) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      if (currentUser) {
        await checkSubscriptionStatus(currentUser);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const checkSubscriptionStatus = async (user: User | null) => {
    if (user) {
      setIsLoading(true);
      const subscribed = await checkSubscription();
      setIsSubscribed(subscribed);
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const user = await signInWithEmail(email, password);
      setUser(user);
      await checkSubscriptionStatus(user);
      // logEvent("user_sign_in", { user_id: user.uid });
    } catch (error) {
      console.error("Error signing in:", error);
      // logEvent("sign_in_error", { error_message: (error as Error).message });
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      const user = await signUpWithEmail(email, password);
      setUser(user);
      await checkSubscriptionStatus(user);
      // logEvent("user_sign_up", { user_id: user.uid });
    } catch (error) {
      console.error("Error signing up:", error);
      // logEvent("sign_up_error", { error_message: (error as Error).message });
      throw error;
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setIsSubscribed(false);
      // logEvent("user_sign_out");
    } catch (error) {
      console.error("Error signing out:", error);
      // logEvent("sign_out_error", { error_message: (error as Error).message });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isSubscribed,
        isLoading,
        signIn,
        signUp,
        signOut: handleSignOut,
        checkSubscriptionStatus,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
