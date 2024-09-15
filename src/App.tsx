import { useState } from "react";
import "./App.css";
import { MainSection } from "./components/main/MainSection";
import { AuthProvider, useAuth } from "./AuthContext";
import { Layout } from "./Layout";
import { SubscriptionPage } from "./components/SubscriptionPage";

const AppContent = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const { user, isSubscribed } = useAuth();

  if (!user) {
    return <div>Please sign in to use Athena</div>;
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
