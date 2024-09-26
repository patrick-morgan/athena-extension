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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { logPageView, logEvent } from "../../analytics";

const isUnsupportedPage = (url: string): boolean => {
  const unsupportedDomains = [
    "chrome://",
    "chrome-extension://",
    "https://chrome.google.com",
    "https://www.google.com/search",
    // Add more unsupported domains as needed
  ];

  // Check against unsupported domains
  if (unsupportedDomains.some((domain) => url.startsWith(domain))) {
    return true;
  }

  try {
    const urlObj = new URL(url);

    // Check if it's a root page (no path segments and no query parameters)
    if (urlObj.pathname === "/" && urlObj.search === "") {
      return true;
    }

    return false;
  } catch (error) {
    // If URL parsing fails, consider it unsupported
    console.error("Error parsing URL:", error);
    return true;
  }
};

export const MainSection = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [appState, setAppState] = useState<AppStateType | null | undefined>(
    undefined
  );
  const [error, setError] = useState<string | null>(null);
  const [isExtensionPage, setIsExtensionPage] = useState(false);
  const { user, isSubscribed } = useAuth();

  useEffect(() => {
    logPageView("/home");

    const getLocalStorageData = async () => {
      try {
        const resp = await requestContent();
        console.log("Received resp", resp);
        if (!resp || isUnsupportedPage(resp.url)) {
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
    logEvent("analysis_started", { section: "MainSection" });
    try {
      const newAppState = await handleAnalysis();
      setAppState(newAppState);
      logEvent("analysis_completed", {
        section: "MainSection",
        success: true,
        newAppState,
      });
    } catch (err) {
      setError((err as Error).message);
      logEvent("analysis_error", { error_message: (err as Error).message });
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
          Please try again. If problems persist, email pmo@peoplespress.news for
          support
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
      <div className="h-full flex justify-center items-center p-6">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary">
              <AlertCircle className="h-5 w-5" />
              Extension Notice
            </CardTitle>
            <CardDescription>
              This extension can't be used on this page.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Please navigate to a web page to analyze content using Athena.
              Contact support at pmo@peoplespress.news if problems persist.
            </p>
          </CardContent>
        </Card>
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
