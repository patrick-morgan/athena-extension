import { useEffect, useState } from "react";
import {
  ArticlePayload,
  PublicationAnalysisResponse,
  analyzeJournalists,
  analyzeObjectivity,
  analyzePoliticalBias,
  analyzePublication,
  createArticle,
  generateSummary,
} from "../../api/api";
import {
  AppStateType,
  ArticleModel,
  JournalistBiasWithNameModel,
  JournalistsModel,
  ObjectivityBiasResponseType,
  PoliticalBiasResponseType,
  PublicationModel,
  SummaryModel,
} from "../../types";
import { AnalyzeArticle } from "../AnalyzeArticle";
import { ArticleSection } from "../article-section/ArticleSection";
import { AnalyzeButton } from "../buttons/AnalyzeButton";
import { JournalistSection } from "../journalist-section/JournalistSection";
import { PublicationSection } from "../publication-section/PublicationSection";
import { SummarySection } from "../summary-section/SummarySection";
import { requestContent } from "./utils";
import { cleanHTML } from "../../parsers/genericParser";
import { HeaderSection } from "./HeaderSection";
import { useAuth } from "../../AuthContext";

type BodySectionProps = {
  analyzing: boolean;
  setAnalyzing: (analyzing: boolean) => void;
};

export const MainSection = ({ analyzing, setAnalyzing }: BodySectionProps) => {
  const [article, setArticle] = useState<ArticleModel | null>(null);
  const [publication, setPublication] = useState<PublicationModel | null>(null);
  const [journalists, setJournalists] = useState<JournalistsModel[] | null>(
    null
  );
  const { user, checkSubscriptionStatus } = useAuth();

  const [summary, setSummary] = useState<SummaryModel | null>(null);
  const [politicalBias, setPoliticalBias] =
    useState<PoliticalBiasResponseType | null>(null);
  const [objectivityBias, setObjectivityBias] =
    useState<ObjectivityBiasResponseType | null>(null);
  const [journalistsAnalysis, setJournalistsAnalysis] = useState<
    JournalistBiasWithNameModel[] | null
  >(null);
  const [publicationAnalysis, setPublicationAnalysis] =
    useState<PublicationAnalysisResponse | null>(null);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("we mount");
    // On mount, restore the previous state, if we are on previous URL
    const getLocalStorageData = async () => {
      // Request URL from content script
      const resp = await requestContent();
      const newURL = resp?.url;
      if (!newURL) return;
      chrome.storage.local.get(["appState"], (result) => {
        console.log("get app state", result.appState);
        if (result.appState) {
          const appState = result.appState as AppStateType;
          console.log("saved url", appState.currentUrl);
          if (appState.currentUrl && appState.currentUrl === newURL) {
            setArticle(appState.article);
            setPublication(appState.publication);
            setJournalists(appState.journalists);
            setSummary(appState.summary);
            setPoliticalBias(appState.politicalBias);
            setObjectivityBias(appState.objectivityBias);
            setJournalistsAnalysis(appState.journalistsAnalysis);
            setPublicationAnalysis(appState.publicationAnalysis);
          }
        }
      });
    };
    getLocalStorageData();
  }, []);

  useEffect(() => {
    // On mount, check subscription status
    checkSubscriptionStatus();
  }, []);

  const handleAnalysis = async () => {
    const resp = await requestContent();
    const html = resp?.html;
    const url = resp?.url;
    if (!html) {
      setError("Error fetching website content");
      console.error("Error manually requesting HTML");
      return;
    }
    if (!url) {
      setError("Error fetching website content");
      console.error("Error manually requesting URL");
      return;
    }
    try {
      console.log("html:");
      console.log(html);
      const cleanedHTML = cleanHTML(html);
      console.log("cleaned html:");
      console.log(cleanedHTML);

      // Create article
      const articleResp = await createArticle({ url, html: cleanedHTML });

      setArticle(articleResp.article);
      setPublication(articleResp.publication);
      setJournalists(articleResp.journalists);

      const payload: ArticlePayload = {
        id: articleResp.article.id,
        text: articleResp.article.text,
      };

      // Analyze article section
      // Execute API calls in parallel
      const [summary, politicalBias, objectivityScore] = await Promise.all([
        generateSummary(payload),
        analyzePoliticalBias(payload),
        analyzeObjectivity(payload),
      ]);

      console.log("Summary:", summary);
      console.log("Political Bias:", politicalBias);
      console.log("Objectivity Score:", objectivityScore);

      if (!summary || !politicalBias || !objectivityScore) {
        setError("Error analyzing article");
        return;
      }

      setSummary(summary);
      setPoliticalBias(politicalBias);
      setObjectivityBias(objectivityScore);
      setAnalyzing(false);

      // Analyze journalists
      const journalistAnalysis = await analyzeJournalists({
        articleId: articleResp.article.id,
      });
      console.log("Journalists Analysis:", journalistAnalysis);
      setJournalistsAnalysis(journalistAnalysis);

      // Analyze publication
      const pubAnalysis = await analyzePublication({
        publicationId: articleResp.article.publication,
      });
      console.log("Publication Analysis:", pubAnalysis);
      setPublicationAnalysis(pubAnalysis);

      // Set chrome storage state
      const appState: AppStateType = {
        currentUrl: url,
        article: articleResp.article,
        publication: articleResp.publication,
        journalists: articleResp.journalists,
        summary: summary,
        politicalBias: politicalBias,
        objectivityBias: objectivityScore,
        journalistsAnalysis: journalistAnalysis,
        publicationAnalysis: pubAnalysis,
      };
      chrome.storage.local.set({ appState }, () => {
        console.log("App state is saved.");
      });
    } catch (error) {
      console.error("Error executing API calls:", error);
      setError("Error analyzing article");
    } finally {
      setAnalyzing(false);
    }
  };

  if (!user) {
    return (
      <div className="w-full h-full flex gap-4 flex-col mt-8 justify-start items-center">
        <h2 className="text-2xl">Please sign in to use Athena</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 flex justify-start items-center">
        {error}
      </div>
    );
  }
  if (analyzing || !summary || !politicalBias || !objectivityBias) {
    return (
      <div className="w-full h-full flex gap-4 flex-col mt-8 justify-start items-center">
        <AnalyzeArticle />
        <AnalyzeButton
          analyzing={analyzing}
          onClick={() => {
            setAnalyzing(true);
            handleAnalysis();
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full pt-4 flex gap-4 flex-col justify-start items-center">
      {article && publication && journalists && (
        <HeaderSection
          article={article}
          publication={publication}
          journalists={journalists}
        />
      )}
      <SummarySection summaryResponse={summary} />
      <ArticleSection
        politicalBias={politicalBias}
        objectivityBias={objectivityBias}
      />
      {journalistsAnalysis && (
        <JournalistSection journalistsBias={journalistsAnalysis} />
      )}
      {publicationAnalysis && (
        <PublicationSection pubResponse={publicationAnalysis} />
      )}
    </div>
  );
};
