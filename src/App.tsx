import { useState } from "react";
import "./App.css";
import { MainSection } from "./components/main/MainSection";
import { AuthProvider, useAuth } from "./AuthContext";
import { Layout } from "./Layout";
import { SubscriptionPage } from "./components/SubscriptionPage";
import { SignInPrompt } from "./components/SignInPrompt"; // Import the new component
import { Spinner } from "./components/spinner";

const AppContent = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const { user, isSubscribed, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <SignInPrompt />; // Use the new SignInPrompt component
  }

  if (!isSubscribed) {
    return <SubscriptionPage />;
  }

  return <MainSection analyzing={analyzing} setAnalyzing={setAnalyzing} />;
};

export const App = () => {
  return (
    <AuthProvider>
      <Layout>
        <div className="mx-auto h-full w-full">
          <AppContent />
        </div>
      </Layout>
    </AuthProvider>
  );
};
