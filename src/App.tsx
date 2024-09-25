import {
  Navigate,
  Route,
  BrowserRouter as Router,
  Routes,
} from "react-router-dom";
import "./App.css";
import { AuthProvider, useAuth } from "./AuthContext";
import { Layout } from "./Layout";
import { SettingsPage } from "./components/SettingsPage";
import { SignInPrompt } from "./components/SignInPrompt";
import { MainSection } from "./components/MainSection";
import { Spinner } from "./components/spinner";
import { AboutPage } from "./components/AboutPage";
import { SupportPage } from "./components/SupportPage";

const AppContent = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!user) {
    return <SignInPrompt />;
  }

  return (
    <Routes>
      <Route path="/" element={<MainSection />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/support" element={<SupportPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Layout>
          <div className="mx-auto h-full w-full">
            <AppContent />
          </div>
        </Layout>
      </Router>
    </AuthProvider>
  );
};
