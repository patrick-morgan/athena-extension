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
import { getParser } from "../../parsers/parsers";
import {
  AppStateType,
  JournalistBiasWithNameModel,
  ObjectivityBiasResponseType,
  PoliticalBiasResponseType,
  SummaryModel,
} from "../../types";
import { AnalyzeArticle } from "../AnalyzeArticle";
import { ArticleSection } from "../article-section/ArticleSection";
import { AnalyzeButton } from "../buttons/AnalyzeButton";
import { JournalistSection } from "../journalist-section/JournalistSection";
import { PublicationSection } from "../publication-section/PublicationSection";
import { SummarySection } from "../summary-section/SummarySection";
import { requestContent } from "./utils";

type BodySectionProps = {
  analyzing: boolean;
  setAnalyzing: (analyzing: boolean) => void;
};

export const MainSection = ({ analyzing, setAnalyzing }: BodySectionProps) => {
  // const [currentUrl, setCurrentUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
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

  useEffect(() => {
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

  const handleAnalysis = async () => {
    const resp = await requestContent();
    const newHTML = resp?.html;
    const newURL = resp?.url;
    if (!newHTML) {
      setError("Error fetching website content");
      console.error("Error manually requesting HTML");
      return;
    }
    if (!newURL) {
      setError("Error fetching website content");
      console.error("Error manually requesting URL");
      return;
    }
    const parser = getParser(newURL, newHTML);
    const articleData = parser.parse();

    console.log("articleData", articleData);
    if (!articleData.text) {
      console.error("No article data found");
      return;
    }

    try {
      // Create article
      const article = await createArticle(articleData);

      const payload: ArticlePayload = {
        id: article.id,
        text: articleData.text,
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
      const journalistAnalysis = await analyzeJournalists(articleData);
      console.log("Journalists Analysis:", journalistAnalysis);
      setJournalistsAnalysis(journalistAnalysis);

      // Analyze publication
      const pubAnalysis = await analyzePublication({
        publicationId: article.publication,
      });
      console.log("Publication Analysis:", pubAnalysis);
      setPublicationAnalysis(pubAnalysis);

      // Set chrome storage state
      const appState: AppStateType = {
        currentUrl: newURL,
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

  // For when i add displaying of title and date:
  // Display the date in a readable format with time zone
  // const formattedDate = formatDate(parsedDate, 'America/New_York');

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
