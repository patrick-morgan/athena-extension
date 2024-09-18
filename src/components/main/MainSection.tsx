import { useState, useEffect } from "react";
import { useAuth } from "../../AuthContext";
import { requestContent } from "./utils";
import { AnalyzeArticle } from "../AnalyzeArticle";
import { AnalyzeButton } from "../buttons/AnalyzeButton";
import { HeaderSection } from "./HeaderSection";
import { SummarySection } from "../summary-section/SummarySection";
import { ArticleSection } from "../article-section/ArticleSection";
import { JournalistSection } from "../journalist-section/JournalistSection";
import { PublicationSection } from "../publication-section/PublicationSection";
import { SubscriptionPage } from "../SubscriptionPage";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { handleAnalysis, AppStateType } from "./analysisHandler";

export const MainSection = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [appState, setAppState] = useState<AppStateType | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user, isSubscribed } = useAuth();

  useEffect(() => {
    const getLocalStorageData = async () => {
      const resp = await requestContent();
      const newURL = resp?.url;
      if (!newURL) return;
      chrome.storage.local.get(["appState"], (result) => {
        if (result.appState && result.appState.currentUrl === newURL) {
          setAppState(result.appState as AppStateType);
        }
      });
    };
    getLocalStorageData();
  }, []);

  const onAnalyze = async () => {
    setAnalyzing(true);
    try {
      const newAppState = await handleAnalysis();
      setAppState(newAppState);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setAnalyzing(false);
    }
  };

  if (!user) {
    return (
      <div className="h-full flex justify-center items-center">
        <h2 className="text-2xl font-semibold">Please sign in to use Athena</h2>
      </div>
    );
  }

  if (!isSubscribed) {
    return <SubscriptionPage />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (analyzing) {
    return (
      <div className="space-y-6">
        <Skeleton className="w-full h-12" />
        <Skeleton className="w-full h-48" />
        <Skeleton className="w-full h-64" />
        <Skeleton className="w-full h-64" />
        <Skeleton className="w-full h-64" />
      </div>
    );
  }

  if (!appState) {
    return (
      <div className="h-full flex flex-col gap-6 justify-center items-center">
        <AnalyzeArticle />
        <AnalyzeButton analyzing={false} onClick={onAnalyze} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <HeaderSection
        article={appState.article}
        publication={appState.publication}
        journalists={appState.journalists}
      />
      <SummarySection summaryResponse={appState.summary} />
      <ArticleSection
        politicalBias={appState.politicalBias}
        objectivityBias={appState.objectivityBias}
      />
      {appState.journalistsAnalysis && (
        <JournalistSection journalistsBias={appState.journalistsAnalysis} />
      )}
      {appState.publicationAnalysis && (
        <PublicationSection pubResponse={appState.publicationAnalysis} />
      )}
    </div>
  );
};
