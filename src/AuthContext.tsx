import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "firebase/auth";
import { signInWithChrome, getCurrentUser, signOut } from "../firebaseConfig";
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
    } catch (error) {
      console.error("Error signing in:", error);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUser(null);
    setIsSubscribed(false);
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
