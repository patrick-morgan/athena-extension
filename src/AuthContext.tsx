import { User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  logAnalyticsEvent,
  signInWithChrome,
  signOut,
} from "../firebaseConfig";
import { checkSubscription } from "./api/stripe";

interface AuthContextType {
  user: User | null;
  isSubscribed: boolean;
  isLoading: boolean;
  signIn: () => Promise<void>;
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

  const signIn = async () => {
    try {
      const user = await signInWithChrome();
      setUser(user);
      await checkSubscriptionStatus(user);
      logAnalyticsEvent("user_signed_in", { userId: user.uid });
    } catch (error) {
      console.error("Error signing in:", error);
      logAnalyticsEvent("sign_in_error", { error: (error as Error).message });
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      setUser(null);
      setIsSubscribed(false);
      logAnalyticsEvent("user_signed_out");
    } catch (error) {
      console.error("Error signing out:", error);
      logAnalyticsEvent("sign_out_error", { error: (error as Error).message });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isSubscribed,
        isLoading,
        signIn,
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
