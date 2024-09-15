import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "firebase/auth";
import { auth, signInWithChrome } from "../firebaseConfig";
import { checkSubscription } from "./api/stripe";

interface AuthContextType {
  user: User | null;
  isSubscribed: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  checkSubscriptionStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isSubscribed, setIsSubscribed] = useState<boolean>(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        checkSubscription();
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async () => {
    try {
      await signInWithChrome();
    } catch (error) {
      console.error("Error signing in with Chrome Identity API", error);
    }
  };

  const signOut = () => auth.signOut();

  const checkSubscriptionStatus = async () => {
    console.log("checking");
    if (user) {
      const subscribed = await checkSubscription();
      console.log("user sub", subscribed);
      setIsSubscribed(subscribed);
    }
  };

  return (
    <AuthContext.Provider
      value={{ user, isSubscribed, signIn, signOut, checkSubscriptionStatus }}
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
