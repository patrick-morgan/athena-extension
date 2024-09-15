import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { User } from "firebase/auth";
import { auth, signInWithChrome } from "../firebaseConfig";
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

  const checkSubscriptionStatus = useCallback(async (user: User | null) => {
    if (user) {
      setIsLoading(true);
      const subscribed = await checkSubscription();
      setIsSubscribed(subscribed);
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        checkSubscriptionStatus(user);
      } else {
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [checkSubscriptionStatus]);

  const signIn = async () => {
    try {
      await signInWithChrome();
    } catch (error) {
      console.error("Error signing in with Chrome Identity API", error);
    }
  };

  const signOut = () => auth.signOut();

  return (
    <AuthContext.Provider
      value={{
        user,
        isSubscribed,
        isLoading,
        signIn,
        signOut,
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
