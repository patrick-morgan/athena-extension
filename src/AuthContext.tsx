import { User } from "firebase/auth";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  getCurrentUser,
  signInWithEmail,
  signUpWithEmail,
  signOut,
  resendVerificationEmail,
} from "../firebaseConfig";
import { checkSubscription } from "./api/stripe";
import {
  getUserUsage,
  trackArticleAnalysis,
  UserUsageResponse,
} from "./api/api";
import { logger } from "./logger";

interface AuthContextType {
  user: User | null;
  isSubscribed: boolean;
  isLoading: boolean;
  usage: UserUsageResponse | null;
  isEmailVerified: boolean;
  resendVerificationEmail: () => Promise<void>;
  trackAnalysis: () => Promise<void>;
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
  const [isSubscribed, setIsSubscribed] = useState<boolean>(true);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [usage, setUsage] = useState<UserUsageResponse | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState<boolean>(false);

  useEffect(() => {
    const initAuth = async () => {
      const currentUser = await getCurrentUser();
      setUser(currentUser);
      logger.log("currentUser", currentUser);
      if (currentUser) {
        setIsEmailVerified(currentUser.emailVerified);
        await checkSubscriptionStatus(currentUser);
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        if (user && !user.emailVerified) {
          user.reload().then(() => {
            setIsEmailVerified(user.emailVerified);
          });
        } else {
          clearInterval(interval);
        }
      }, 3000);

      return () => clearInterval(interval);
    }
  }, [user]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const usageData = await getUserUsage();
        setUsage(usageData);
      } catch (error) {
        console.error("Error fetching usage data:", error);
      }
    };

    if (user && !isSubscribed) {
      fetchUserData();
    }
  }, [user, isSubscribed]);

  const trackAnalysis = async () => {
    if (user) {
      const resp = await trackArticleAnalysis();
      setUsage(resp);
    }
  };

  const checkSubscriptionStatus = async (user: User | null) => {
    setIsSubscribed(true);
    // if (user) {
    //   setIsLoading(true);
    //   const subscribed = await checkSubscription();
    //   setIsSubscribed(subscribed);
    //   setIsLoading(false);
    // }
  };

  // const checkSubscriptionStatus = async (user: User | null) => {
  //   if (user) {
  //     setIsLoading(true);
  //     const subscribed = await checkSubscription();
  //     setIsSubscribed(subscribed);
  //     setIsLoading(false);
  //   }
  // };

  const handleResendVerificationEmail = async () => {
    if (user) {
      try {
        await resendVerificationEmail(user);
      } catch (error) {
        logger.error("Error resending verification email:", error);
      }
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const user = await signInWithEmail(email, password);
      setUser(user);
      await checkSubscriptionStatus(user);
      logger.log("User signed in successfully:", user.email);
    } catch (error) {
      logger.error("Error signing in:", error);
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
      logger.error("Error signing up:", error);
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
      logger.error("Error signing out:", error);
      // logEvent("sign_out_error", { error_message: (error as Error).message });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isSubscribed,
        isLoading,
        usage,
        isEmailVerified: isEmailVerified,
        resendVerificationEmail: handleResendVerificationEmail,
        trackAnalysis,
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
