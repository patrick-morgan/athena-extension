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
    logPageView("/home");

    const initializeState = async () => {
      try {
        const resp = await requestContent();
        if (!resp || isUnsupportedPage(resp.url)) {
          setIsExtensionPage(true);
          return;
        }
        console.log("getting for article url", resp.url);
        console.log("encoded url", encodeURIComponent(resp.url));

        // Use Promise-based approach for chrome.storage.local.get
        const getStorageData = (key: string): Promise<any> => {
          return new Promise((resolve) => {
            chrome.storage.local.get([key], (result) => {
              resolve(result[key]);
            });
          });
        };

        const articleData = await getStorageData(encodeURIComponent(resp.url));
        if (articleData) {
          const article = articleData as ArticleWithAnalysis;
          console.log("local storage result", article);

          const publicationAnalysis = (await getStorageData(
            article.publication
          )) as PublicationAnalysisResponse | null;
          console.log("publication analysis", publicationAnalysis);

          const journalistsAnalyses: JournalistBiasWithNameModel[] =
            await Promise.all(
              article.article_authors.map(async (journalist) => {
                console.log("getting journalist", journalist.journalist_id);
                return (await getStorageData(
                  journalist.journalist_id
                )) as JournalistBiasWithNameModel;
              })
            );
          console.log("journalists analyses", journalistsAnalyses);

          console.log("seting app state", {
            currentUrl: resp.url,
            article,
            publication: publicationAnalysis
              ? publicationAnalysis.publication
              : null,
            journalists: article.article_authors.map(
              (journalist) => journalist.journalist
            ),
            summary: article.summary,
            politicalBiasScore: article.political_bias_score,
            objectivityBiasScore: article.objectivity_score,
            journalistsAnalysis: journalistsAnalyses,
            publicationAnalysis: publicationAnalysis,
            error: null,
          });

          setAppState({
            currentUrl: resp.url,
            article,
            publication: publicationAnalysis
              ? publicationAnalysis.publication
              : null,
            journalists: article.article_authors.map(
              (journalist) => journalist.journalist
            ),
            summary: article.summary,
            politicalBiasScore: article.political_bias_score,
            objectivityBiasScore: article.objectivity_score,
            journalistsAnalysis: journalistsAnalyses,
            publicationAnalysis: publicationAnalysis,
            error: null,
          });
        } else {
          setAppState(null);
        }

        // Check if the article needs updating
        const { head, body } = cleanHTML(resp.html);
        const dateUpdatedResp = await checkDateUpdated({
          url: resp.url,
          head,
          body,
        });
        console.log("date updated resp", dateUpdatedResp);

        if (dateUpdatedResp && dateUpdatedResp.needsUpdate) {
          setUpdateAvailable(true);
        }
        setUpdateAvailable(false);
      } catch (err) {
        setIsExtensionPage(true);
        setAppState(null);
      }
    };

    initializeState();
  }, []);

  const onAnalyze = async () => {
    setAnalyzing(true);
    setAppState(null); // Reset appState to null when starting a new analysis
    logEvent("analysis_started", { section: "MainSection" });
    try {
      await handleAnalysis((partialState) => {
        setAppState(
          (prevState) =>
            ({
              ...prevState,
              ...partialState,
            } as AppStateType)
        );

        if (partialState.error) {
          setError(partialState.error);
        }
      });
      logEvent("analysis_completed", { section: "MainSection", success: true });
    } catch (err) {
      setError((err as Error).message);
      logEvent("analysis_error", { error_message: (err as Error).message });
    } finally {
      setAnalyzing(false);
    }
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

      {updateAvailable && (
        <ReAnalyzeButton onClick={handleQuickParse} analyzing={analyzing} />
      )}
    </div>
  );
};
