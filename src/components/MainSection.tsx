import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { useAuth } from "../AuthContext";
import { AppStateType, handleAnalysis } from "./analysisHandler";
import { AnalyzeArticle } from "./AnalyzeArticle";
import { AnalyzeButton } from "./AnalyzeButton";
import { ArticleSection } from "./ArticleSection";
import { HeaderSection } from "./HeaderSection";
import { JournalistSection } from "./JournalistSection";
import { PublicationSection } from "./PublicationSection";
import { Spinner } from "./spinner";
import { SubscriptionPage } from "./SubscriptionPage";
import { SummarySection } from "./SummarySection";
import { requestContent } from "./utils";

export const MainSection = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [appState, setAppState] = useState<AppStateType | null | undefined>(
    undefined
  );
  const [error, setError] = useState<string | null>(null);
  const [isExtensionPage, setIsExtensionPage] = useState(false);
  const { user, isSubscribed } = useAuth();

  useEffect(() => {
    const getLocalStorageData = async () => {
      try {
        const resp = await requestContent();
        console.log("Received resp", resp);
        if (!resp) {
          setIsExtensionPage(true);
          setAppState(null);
          return;
        }
        const newURL = resp.url;
        chrome.storage.local.get(["appState"], (result) => {
          if (result.appState && result.appState.currentUrl === newURL) {
            setAppState(result.appState as AppStateType);
          } else {
            setAppState(null);
          }
        });
      } catch (err) {
        setIsExtensionPage(true);
        setAppState(null);
        return;
      }
    };
    getLocalStorageData();
  }, []);

  const onAnalyze = async () => {
    setAnalyzing(true);
    try {
      const newAppState = await handleAnalysis();
      // console.info("New app state", newAppState);
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
        <AlertDescription>
          If problems persist please email pmo@peoplespress.news or text
          616-337-9949 for support
        </AlertDescription>
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

  if (isExtensionPage) {
    return (
      <div className="h-full flex justify-center items-center">
        <h2 className="text-2xl font-semibold">
          This extension can't be used on this page. Please navigate to a web
          page to analyze.
        </h2>
      </div>
    );
  }

  if (appState === undefined) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Spinner />
      </div>
    );
  }

  if (!appState) {
    return (
      <div className="h-full flex flex-col gap-6 justify-center items-center mt-14">
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
      <SummarySection summaryResponse={appState.summary} />
    </div>
  );
};
