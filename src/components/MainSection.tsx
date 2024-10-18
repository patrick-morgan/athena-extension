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
import {
  ArticleAuthorType,
  ArticleModel,
  JournalistBiasWithNameModel,
  JournalistsModel,
} from "@/types";
import {
  analyzeJournalists,
  analyzePublication,
  checkDateUpdated,
  PublicationAnalysisResponse,
  quickParseArticle,
} from "@/api/api";
import { cleanHTML } from "@/parsers/genericParser";
import { ReAnalyzeButton } from "./ReAnalyzeButton";
import { getIdToken } from "../../firebaseConfig";

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

const getFromStorage = (key: string): Promise<any> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(key, (result) => {
      resolve(result[key]);
    });
  });
};

type ArticleWithAnalysis = ArticleModel & {
  summary: string;
  political_bias_score: number;
  objectivity_score: number;
};

export const MainSection = () => {
  const [analyzing, setAnalyzing] = useState(false);
  const [appState, setAppState] = useState<AppStateType | null | undefined>(
    undefined
  );
  const [error, setError] = useState<string | null>(null);
  const [isExtensionPage, setIsExtensionPage] = useState(false);
  const { user, isSubscribed } = useAuth();
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const updateBackgroundToken = async () => {
      const token = await getIdToken();
      if (token) {
        chrome.runtime.sendMessage({ action: "updateIdToken", token });
      }
    };

    updateBackgroundToken();
  }, [user]); // Add this effect to update the token when the user changes

  useEffect(() => {
    logPageView("/home");
    const initializeState = async () => {
      try {
        const resp = await requestContent();
        if (!resp || isUnsupportedPage(resp.url)) {
          setIsExtensionPage(true);
          return;
        }

        console.log("trying to loda pre-loaded shit");

        // Try to load pre-analyzed data first
        const storedData = await loadStoredAnalysisData(resp.url);
        if (storedData) {
          setAppState(storedData);
          return;
        }

        // If no stored data, check the analysis state
        const analysisState = await getAnalysisState(resp.url);
        if (analysisState && analysisState.status === "in_progress") {
          setAnalyzing(true);
          pollAnalysisStatus(resp.url);
        } else if (analysisState && analysisState.status === "completed") {
          // await loadAnalysisData(resp.url);
          const storedData = await loadStoredAnalysisData(resp.url);
          if (storedData) {
            setAppState(storedData);
            setAnalyzing(false);
            return;
          }
        } else {
          setAppState(null);
        }
      } catch (err) {
        setIsExtensionPage(true);
        setAppState(null);
      }
    };

    initializeState();
  }, []);

  const loadStoredAnalysisData = async (
    url: string
  ): Promise<AppStateType | null> => {
    try {
      const storedData = (await getFromStorage(
        encodeURIComponent(url)
      )) as ArticleWithAnalysis | null;

      console.log("ourstored data", storedData);
      if (storedData) {
        // Load publication analysis
        const publicationAnalysis = (await getFromStorage(
          storedData.publication
        )) as PublicationAnalysisResponse;

        console.log("publcatin analysis", publicationAnalysis);
        // console.log("journalist anslyis", storaed)

        console.log("stored data", storedData);

        // Load journalists analysis
        const journalistsAnalysis = await Promise.all(
          storedData.article_authors.map(async (author: ArticleAuthorType) => {
            const journalistData = (await getFromStorage(
              author.journalist_id
            )) as JournalistBiasWithNameModel;
            return journalistData;
          })
        );
        // Remove undefined
        const cleanedJournalistAnalysis = journalistsAnalysis.filter((j) => j);

        // const journalistsAnalysis: JournalistBiasWithNameModel[] = [];

        return {
          currentUrl: url,
          article: storedData,
          publication: publicationAnalysis?.publication,
          journalists: storedData.article_authors
            .map((author) => author.journalist)
            .filter((j) => j),
          summary: storedData.summary,
          politicalBiasScore: storedData.political_bias_score,
          objectivityBiasScore: storedData.objectivity_score,
          journalistsAnalysis: cleanedJournalistAnalysis,
          publicationAnalysis,
          error: null,
        };
      }
    } catch (error) {
      console.error("Error loading stored analysis data:", error);
    }
    return null;
  };

  const MAX_POLL_ATTEMPTS = 3;
  const POLL_INTERVAL = 3000; // 3 seconds

  const pollAnalysisStatus = async (url: string, attemptCount: number = 0) => {
    const checkStatus = async () => {
      const state = await getAnalysisState(url);
      console.log("analysis state MainSection", state);
      if (state && state.status === "completed") {
        // await loadAnalysisData(url);
        // setAnalyzing(false);
        const storedData = await loadStoredAnalysisData(url);
        if (storedData) {
          setAppState(storedData);
          setAnalyzing(false);
          return;
        }
      } else if (state && state.status === "error") {
        setError(state.message || "An error occurred during analysis");
        setAnalyzing(false);
      } else {
        if (attemptCount >= MAX_POLL_ATTEMPTS) {
          console.log("Max poll attempts reached. Restarting analysis.");
          restartAnalysis(url);
        } else {
          setTimeout(
            () => pollAnalysisStatus(url, attemptCount + 1),
            POLL_INTERVAL
          );
        }
      }
    };
    checkStatus();
  };

  const restartAnalysis = async (url: string) => {
    try {
      const resp = await requestContent();
      if (!resp || isUnsupportedPage(resp.url)) {
        throw new Error("Unsupported page");
      }
      const { head, body } = cleanHTML(resp.html);
      const hostname = new URL(resp.url).hostname;

      // Send message to background script to restart analysis
      chrome.runtime.sendMessage({
        action: "restartAnalysis",
        data: { url: resp.url, hostname, head, body },
      });

      // Reset attempt count and start polling again
      pollAnalysisStatus(url, 0);
    } catch (err) {
      setError((err as Error).message);
      logEvent("analysis_restart_error", {
        error_message: (err as Error).message,
      });
      setAnalyzing(false);
    }
  };

  const onAnalyze = async () => {
    setAnalyzing(true);
    setAppState(null);
    logEvent("analysis_started", { section: "MainSection" });
    try {
      const resp = await requestContent();
      if (!resp || isUnsupportedPage(resp.url)) {
        throw new Error("Unsupported page");
      }

      // Check for stored data first
      const storedData = await loadStoredAnalysisData(resp.url);
      if (storedData) {
        setAppState(storedData);
        setAnalyzing(false);
        return;
      }

      const { head, body } = cleanHTML(resp.html);
      const hostname = new URL(resp.url).hostname;

      // Send message to background script to start analysis
      chrome.runtime.sendMessage({
        action: "startAnalysis",
        data: { url: resp.url, hostname, head, body },
      });

      pollAnalysisStatus(resp.url);
    } catch (err) {
      setError((err as Error).message);
      logEvent("analysis_error", { error_message: (err as Error).message });
      setAnalyzing(false);
    }
  };

  const getAnalysisState = async (
    url: string
  ): Promise<{ status: string; message?: string } | null> => {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(
        { action: "getAnalysisState", url },
        (response) => {
          resolve(response);
        }
      );
    });
  };

  const handleQuickParse = async () => {
    setAnalyzing(true);
    setUpdateAvailable(false);
    logEvent("quick_parse_started", { section: "MainSection" });
    try {
      const resp = await requestContent();
      if (!resp || isUnsupportedPage(resp.url)) {
        throw new Error("Unsupported page");
      }

      const { head, body } = cleanHTML(resp.html);
      const hostname = new URL(resp.url).hostname;

      const quickParseResp = await quickParseArticle({
        url: resp.url,
        hostname,
        head,
        body,
      });

      if (!quickParseResp) {
        throw new Error("Error quick parsing article");
      }

      const journalistsAnalysis = await analyzeJournalists({
        articleId: quickParseResp.article.id,
      });

      const publicationAnalysis = await analyzePublication({
        publicationId: quickParseResp.publication.id,
      });

      setAppState({
        currentUrl: resp.url,
        article: quickParseResp.article,
        journalists: quickParseResp.journalists,
        publication: quickParseResp.publication,
        summary: quickParseResp.summary,
        politicalBiasScore: quickParseResp.political_bias_score,
        objectivityBiasScore: quickParseResp.objectivity_score,
        journalistsAnalysis,
        publicationAnalysis,
        error: null,
      });

      logEvent("quick_parse_completed", {
        section: "MainSection",
        success: true,
      });
    } catch (err) {
      setError((err as Error).message);
      logEvent("quick_parse_error", { error_message: (err as Error).message });
    } finally {
      setAnalyzing(false);
    }
  };
  // const handleReAnalyze = async () => {
  //   setAnalyzing(true);
  //   setUpdateAvailable(false);
  //   // Call the quick parse function here
  //   // You'll need to implement this function or use an existing one
  //   await handleQuickParse();
  //   setAnalyzing(false);
  // };
  // const handleReAnalyze = handleQuickParse;

  console.log("app state", appState);

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

  if (appState?.error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{appState.error}</AlertDescription>
        <AlertDescription>
          Please try again. If problems persist, email pmo@peoplespress.news for
          support
        </AlertDescription>
      </Alert>
    );
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
        <AnalyzeButton analyzing={analyzing} onClick={onAnalyze} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {appState.article ? (
        <HeaderSection
          article={appState.article}
          publication={appState.publication}
          journalists={appState.journalists}
        />
      ) : (
        <Skeleton className="w-full h-24" />
      )}

      {appState.politicalBiasScore && appState.objectivityBiasScore ? (
        <ArticleSection
          politicalBiasScore={appState.politicalBiasScore}
          objectivityBiasScore={appState.objectivityBiasScore}
        />
      ) : (
        <Skeleton className="w-full h-64" />
      )}

      {appState.summary ? (
        <SummarySection summary={appState.summary} />
      ) : (
        <Skeleton className="w-full h-64" />
      )}

      {appState.journalistsAnalysis ? (
        <JournalistSection journalistsBias={appState.journalistsAnalysis} />
      ) : (
        <Skeleton className="w-full h-64" />
      )}

      {appState.publicationAnalysis ? (
        <PublicationSection pubResponse={appState.publicationAnalysis} />
      ) : (
        <Skeleton className="w-full h-64" />
      )}

      {/* {updateAvailable && (
        <ReAnalyzeButton onClick={handleQuickParse} analyzing={analyzing} />
      )} */}
    </div>
  );
};
