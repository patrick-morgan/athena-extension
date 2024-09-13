import { useState } from "react";
import "./App.css";
import { MainSection } from "./components/main/MainSection";
import { AuthProvider } from "./AuthContext";
import { Layout } from "./Layout";

export const App = () => {
  const [analyzing, setAnalyzing] = useState(false);

  return (
    <AuthProvider>
      <Layout>
        <div className="mx-auto h-full w-full">
          <MainSection analyzing={analyzing} setAnalyzing={setAnalyzing} />
        </div>
      </Layout>
    </AuthProvider>
  );
};
