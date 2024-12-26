import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { cleanHTML } from "@/parsers/genericParser";
import { AppStateType } from "@/types";
import { AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { getIdToken } from "../../firebaseConfig";
import { initiateSubscription } from "../api/stripe";
import { useAuth } from "../AuthContext";
import { AnalyzeArticle } from "./AnalyzeArticle";
import { AnalyzeButton } from "./AnalyzeButton";
import { ArticleSection } from "./ArticleSection";
import { HeaderSection } from "./HeaderSection";
import { JournalistPage } from "./JournalistPage";
import PublicationPage from "./PublicationPage";
import { Spinner } from "./spinner";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { requestContent, scrollToTop } from "./utils";
import { BlurredJournalistSection } from "./JournalistSection";
import { BlurredPublicationSection } from "./PublicationSection";
import { BlurredSummarySection } from "./SummarySection";
import { UsageDisplay } from "./UsageDisplay";
import { ArticleChat } from "./ArticleChat";

const isUnsupportedPage = (url: string): boolean => {
  const unsupportedDomains = [
    "chrome://",
    "chrome-extension://",
    "https://chrome.google.com",
    "https://www.google.com/search",
    "https://drive.google.com/",
    "https://docs.google.com/",
    "https://checkout.stripe.com",
    "https://billing.stripe.com/",
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
  const { user, isSubscribed, usage, trackAnalysis } = useAuth();
  const isPremium = isSubscribed; // Assuming isSubscribed indicates premium status
  const [selectedJournalist, setSelectedJournalist] = useState<string | null>(
    null
  );
  const [selectedPublication, setSelectedPublication] = useState<string | null>(
    null
  );

  useEffect(() => {
    const updateBackgroundToken = async () => {
      const token = await getIdToken();
      if (token) {
        chrome.runtime.sendMessage({ action: "updateIdToken", token });
      }
    };

    updateBackgroundToken();
  }, [user]); // Add this effect to update the token when the user changes

  const handleSubscribe = async () => {
    if (user) {
      try {
        const checkoutUrl = await initiateSubscription();
        window.open(checkoutUrl, "_blank");
        // logEvent("subscription_initiated", { userId: user.uid });
      } catch (error) {
        console.error("Error initiating subscription:", error);
        // logEvent("subscription_error", {
        //   error: (error as Error).message,
        // });
      }
    }
  };

  useEffect(() => {
    // logPageView("/home");
    const initializeState = async () => {
      try {
        const resp = await requestContent();
        if (!resp || isUnsupportedPage(resp.url)) {
          setIsExtensionPage(true);
          return;
        }

        console.log("Trying to load pre-analyzed data");

        // Try to load quick parse data
        const quickParseData = await loadQuickParseData(resp.url);
        console.log("loadedQuickParse data", quickParseData);
        if (quickParseData) {
          setAppState(quickParseData);

          // Check detailed analysis state
          const detailedState = await getDetailedAnalysisState(resp.url);
          console.log("detailedStae", detailedState);
          if (detailedState && detailedState.status === "in_progress") {
            setAnalyzing(true);
            pollDetailedAnalysisStatus(resp.url);
          } else if (detailedState && detailedState.status === "completed") {
            const detailedData = await loadDetailedAnalysisData(resp.url);
            if (detailedData) {
              setAppState((prevState) => {
                if (!prevState) {
                  // If there's no previous state, create a new state with the detailed data
                  return {
                    currentUrl: "", // You might want to set this to the current URL
                    article: null,
                    publication: null,
                    journalists: null,
                    summary: null,
                    politicalBiasScore: null,
                    objectivityBiasScore: null,
                    journalistsAnalysis:
                      detailedData.journalistsAnalysis ?? null,
                    publicationAnalysis:
                      detailedData.publicationAnalysis ?? null,
                    error: null,
                  };
                }
                // If there is a previous state, merge the new data
                return {
                  ...prevState,
                  journalistsAnalysis:
                    detailedData.journalistsAnalysis ??
                    prevState.journalistsAnalysis,
                  publicationAnalysis:
                    detailedData.publicationAnalysis ??
                    prevState.publicationAnalysis,
                };
              });
            }
            setAnalyzing(false);
          } else {
            // If detailed analysis hasn't started, start it
            startDetailedAnalysis(resp.url);
          }
        } else {
          // Check quick parse state
          const quickParseState = await getQuickParseState(resp.url);
          if (quickParseState && quickParseState.status === "in_progress") {
            setAnalyzing(true);
            pollQuickParseStatus(resp.url);
          } else {
            // No data and no analysis in progress, set appState to null
            setAppState(null);
          }
        }
      } catch (err) {
        console.error("Error initializing state:", err);
        setIsExtensionPage(true);
        setAppState(null);
      }
    };

    initializeState();
  }, []);

  const MAX_POLL_ATTEMPTS = 5;
  const POLL_INTERVAL = 3000; // 3 seconds

  const restartAnalysis = async (url: string) => {
    setAnalyzing(true);
    setAppState(null);
    setError(null);
    // logEvent("analysis_restarted", { section: "MainSection" });

    try {
      const resp = await requestContent();
      if (!resp || isUnsupportedPage(resp.url)) {
        throw new Error("Unsupported page");
      }

      const { head, body } = cleanHTML(resp.html);
      const hostname = new URL(resp.url).hostname;

      // Clear existing analysis data
      await chrome.storage.local.remove([
        encodeURIComponent(url),
        `${encodeURIComponent(url)}_detailed`,
        `quick_parse_state_${encodeURIComponent(url)}`,
        `detailed_analysis_state_${encodeURIComponent(url)}`,
      ]);

      // Start quick parse
      chrome.runtime.sendMessage({
        action: "startQuickParse",
        data: { url: resp.url, hostname, head, body, restart: true },
      });

      pollQuickParseStatus(resp.url);
    } catch (err) {
      setError((err as Error).message);
      // logEvent("analysis_restart_error", {
      //   error_message: (err as Error).message,
      // });
      setAnalyzing(false);
    }
  };

  const loadQuickParseData = async (
    url: string
  ): Promise<AppStateType | null> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(encodeURIComponent(url), (result) => {
        const data = result[encodeURIComponent(url)];
        if (data) {
          resolve({
            currentUrl: url,
            article: data,
            journalists: data.article_authors,
            publication: data.publication, // todo fish
            summary: data.summary,
            politicalBiasScore: data.political_bias_score,
            objectivityBiasScore: data.objectivity_score,
            journalistsAnalysis: null,
            publicationAnalysis: null,
            error: null,
          });
        } else {
          resolve(null);
        }
      });
    });
  };

  const loadDetailedAnalysisData = async (
    url: string
  ): Promise<Partial<AppStateType> | null> => {
    return new Promise((resolve) => {
      chrome.storage.local.get(
        `${encodeURIComponent(url)}_detailed`,
        (result) => {
          const data = result[`${encodeURIComponent(url)}_detailed`];
          if (data) {
            resolve({
              journalistsAnalysis: data.journalistsAnalysis,
              publicationAnalysis: data.publicationAnalysis,
            });
          } else {
            resolve(null);
          }
        }
      );
    });
  };

  async function getQuickParseState(url: string) {
    const result = await chrome.storage.local.get(
      `quick_parse_state_${encodeURIComponent(url)}`
    );
    return result[`quick_parse_state_${encodeURIComponent(url)}`] || null;
  }

  async function getDetailedAnalysisState(url: string) {
    const result = await chrome.storage.local.get(
      `detailed_analysis_state_${encodeURIComponent(url)}`
    );
    console.log("detailed analysis state result:", result);
    return result[`detailed_analysis_state_${encodeURIComponent(url)}`] || null;
  }

  const pollDetailedAnalysisStatus = async (
    url: string,
    attemptCount: number = 0
  ) => {
    const checkStatus = async () => {
      const state = await getDetailedAnalysisState(url);
      if (state && state.status === "completed") {
        const detailedData = await loadDetailedAnalysisData(url);
        if (detailedData) {
          console.log("detailed data foo", detailedData);
          setAppState((prevState) => {
            // THIS may cause a bug may need to fix ye lazy bozo
            if (prevState === null || prevState === undefined) {
              return prevState; // Return null or undefined if prevState is null or undefined
            }
            return {
              ...prevState,
              journalistsAnalysis:
                detailedData.journalistsAnalysis ??
                prevState.journalistsAnalysis,
              publicationAnalysis:
                detailedData.publicationAnalysis ??
                prevState.publicationAnalysis,
            };
          });
        }
      } else if (state && state.status === "error") {
        console.error("Error in detailed analysis:", state.message);
      } else {
        if (attemptCount < MAX_POLL_ATTEMPTS) {
          setTimeout(
            () => pollDetailedAnalysisStatus(url, attemptCount + 1),
            POLL_INTERVAL
          );
        }
      }
    };
    checkStatus();
  };

  const startDetailedAnalysis = (url: string) => {
    chrome.runtime.sendMessage({
      action: "startDetailedAnalysis",
      data: { url },
    });
    pollDetailedAnalysisStatus(url);
  };

  const pollQuickParseStatus = async (
    url: string,
    attemptCount: number = 0
  ) => {
    const checkStatus = async () => {
      const state = await getQuickParseState(url);
      if (state && state.status === "completed") {
        const quickParseData = await loadQuickParseData(url);
        if (quickParseData) {
          setAppState(quickParseData);
          setAnalyzing(false);
          startDetailedAnalysis(url);
        }
      } else if (state && state.status === "error") {
        setError(state.message || "An error occurred during quick parse");
        setAnalyzing(false);
      } else {
        if (attemptCount >= MAX_POLL_ATTEMPTS) {
          console.log(
            "Max poll attempts reached for quick parse. Restarting analysis."
          );
          restartAnalysis(url);
        } else {
          setTimeout(
            () => pollQuickParseStatus(url, attemptCount + 1),
            POLL_INTERVAL
          );
        }
      }
    };
    checkStatus();
  };

  const onAnalyze = async () => {
    // if (!isSubscribed) {
    //   const usage = await getUserUsage();
    //   console.log("usage", usage);
    //   if (usage.articlesRemaining <= 0) {
    //     setError(
    //       `You've reached your monthly limit of ${
    //         usage.totalAllowed
    //       } free articles. Your limit will reset on ${new Date(
    //         usage.nextResetDate
    //       ).toLocaleDateString()}. Please upgrade to continue analyzing articles.`
    //     );
    //     return;
    //   }
    // }

    setAnalyzing(true);
    setAppState(null);
    // logEvent("analysis_started", { section: "MainSection" });
    try {
      const resp = await requestContent();
      if (!resp || isUnsupportedPage(resp.url)) {
        throw new Error("Unsupported page");
      }

      const { head, body } = cleanHTML(resp.html);
      const hostname = new URL(resp.url).hostname;

      // Track the analysis if user is not subscribed
      if (!isSubscribed) {
        await trackAnalysis();
      }

      // Start quick parse
      chrome.runtime.sendMessage({
        action: "startQuickParse",
        data: { url: resp.url, hostname, head, body },
      });

      pollQuickParseStatus(resp.url);
    } catch (err) {
      setError((err as Error).message);
      // logEvent("analysis_error", { error_message: (err as Error).message });
      setAnalyzing(false);
    }
  };

  const handleJournalistClick = (journalistId: string) => {
    setSelectedJournalist(journalistId);
    scrollToTop();
  };

  const handlePublicationClick = () => {
    setSelectedJournalist(null);
    setSelectedPublication(appState?.article?.publication?.id ?? null);
    scrollToTop();
  };

  const handleBackClick = () => {
    setSelectedJournalist(null);
    setSelectedPublication(null);
    scrollToTop();
  };

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
      <div className="flex justify-center items-center h-full p-6">
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
              Please navigate to a news article to analyze content using Athena.
              Contact support at pmo@peoplespress.news if problems persist.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (appState === undefined) {
    return (
      <div className="flex justify-center items-center h-full">
        <Spinner />
      </div>
    );
  }

  if (appState === null) {
    return (
      <div className="flex flex-col gap-6 justify-center items-center h-full">
        <AnalyzeArticle />
        <AnalyzeButton analyzing={analyzing} onClick={onAnalyze} />
        <div className="mt-4 p-4 mx-4 bg-blue-50 border-l-4 border-blue-400 text-blue-700 rounded-md flex items-center">
          <svg
            className="w-5 h-5 mr-2 text-blue-400"
            fill="currentColor"
            viewBox="0 0 20 20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fillRule="evenodd"
              d="M18 10c0 4.418-3.582 8-8 8s-8-3.582-8-8 3.582-8 8-8 8 3.582 8 8zm-8-3a1 1 0 00-1 1v2a1 1 0 102 0V8a1 1 0 00-1-1zm0 6a1 1 0 100 2 1 1 0 000-2z"
              clipRule="evenodd"
            />
          </svg>
          <p className="text-sm">
            Please ensure the content you analyze is suitable for public review.
            Avoid analyzing personal or private information.
          </p>
        </div>
      </div>
    );
  }

  if (selectedJournalist) {
    return (
      <JournalistPage
        journalistId={selectedJournalist}
        publication={appState.publication}
        onPublicationClick={handlePublicationClick}
        onBack={handleBackClick}
        usage={usage}
      />
    );
  }

  if (selectedPublication) {
    return (
      <PublicationPage
        publicationId={selectedPublication}
        onBack={handleBackClick}
        usage={usage}
      />
    );
  }

  return (
    <div className="space-y-6 p-6">
      {!isSubscribed && <UsageDisplay usage={usage} user={user} />}
      {appState.article ? (
        <HeaderSection
          article={appState.article}
          publication={appState.publication}
          journalists={appState.journalists}
          onJournalistClick={handleJournalistClick}
          onPublicationClick={handlePublicationClick}
        />
      ) : (
        <Skeleton className="w-full h-24" />
      )}

      {appState.politicalBiasScore !== null &&
      appState.objectivityBiasScore !== null ? (
        <ArticleSection
          politicalBiasScore={appState.politicalBiasScore}
          objectivityBiasScore={appState.objectivityBiasScore}
        />
      ) : (
        <Skeleton className="w-full h-64" />
      )}

      {!isPremium && (
        <div className="mt-6 mb-2 text-center">
          <h3 className="text-xl font-semibold mb-4">
            Unlock Premium Features
          </h3>
          <p className="mb-4">
            Get access to unlimited in-depth summaries, journalist analyses, and
            publication insights.
          </p>
          <Button onClick={handleSubscribe}>
            Upgrade to Premium for $5/month
          </Button>
        </div>
      )}

      {appState.summary ? (
        <>
          <BlurredSummarySection
            summary={appState.summary}
            isPremium={isPremium}
            usage={usage}
          />
          {appState.article && (
            <ArticleChat
              articleId={appState.article.id}
              isPremium={isPremium}
            />
          )}
        </>
      ) : (
        <Skeleton className="w-full h-64" />
      )}

      {appState.journalistsAnalysis ? (
        <BlurredJournalistSection
          journalistsBias={appState.journalistsAnalysis}
          onJournalistClick={handleJournalistClick}
          isPremium={isPremium}
          usage={usage}
        />
      ) : (
        <Skeleton className="w-full h-64" />
      )}

      {appState.publicationAnalysis ? (
        <BlurredPublicationSection
          pubResponse={appState.publicationAnalysis}
          onPublicationClick={handlePublicationClick}
          isPremium={isPremium}
          usage={usage}
        />
      ) : (
        <Skeleton className="w-full h-64" />
      )}
    </div>
  );
};
