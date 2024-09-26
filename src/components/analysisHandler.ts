import {
  analyzeJournalists,
  analyzeObjectivity,
  analyzePoliticalBias,
  analyzePublication,
  ArticlePayload,
  createArticle,
  generateSummary,
  PublicationAnalysisResponse,
} from "@/api/api";
import {
  ArticleModel,
  JournalistBiasWithNameModel,
  JournalistsModel,
  ObjectivityBiasResponseType,
  PoliticalBiasResponseType,
  PublicationModel,
  SummaryModel,
} from "@/types";
import { requestContent } from "./utils";
import { cleanHTML } from "@/parsers/genericParser";
import { logEvent } from "../../analytics";

export type AppStateType = {
  currentUrl: string;
  article: ArticleModel | null;
  publication: PublicationModel | null;
  journalists: JournalistsModel[] | null;
  summary: SummaryModel | null;
  politicalBias: PoliticalBiasResponseType | null;
  objectivityBias: ObjectivityBiasResponseType | null;
  journalistsAnalysis: JournalistBiasWithNameModel[] | null;
  publicationAnalysis: PublicationAnalysisResponse | null;
};

export const handleAnalysis = async (
  updateCallback: (partialState: Partial<AppStateType>) => void
): Promise<void> => {
  const resp = await requestContent();
  const html = resp?.html;
  const url = resp?.url;

  if (!html || !url) {
    throw new Error("Error fetching website content");
  }

  const cleanedHTML = cleanHTML(html);
  console.log("Cleaned HTML", cleanedHTML);
  logEvent("cleaned_html", { cleanedHTML });

  // Create article
  const articleResp = await createArticle({ url, html: cleanedHTML });

  if (!articleResp) {
    throw new Error("Error reading article");
  }

  // Update with initial article info
  updateCallback({
    currentUrl: url,
    article: articleResp.article,
    publication: articleResp.publication,
    journalists: articleResp.journalists,
  });

  const payload: ArticlePayload = {
    id: articleResp.article.id,
    text: articleResp.article.text,
  };

  // Analyze article section
  // Execute API calls in parallel and update as they complete
  Promise.all([
    generateSummary(payload).then((summary) => {
      console.log("Summary", summary);
      updateCallback({ summary });
      return summary;
    }),
    analyzePoliticalBias(payload).then((politicalBias) => {
      console.log("Political Bias", politicalBias);
      updateCallback({ politicalBias });
      return politicalBias;
    }),
    analyzeObjectivity(payload).then((objectivityBias) => {
      console.log("Objectivity Bias", objectivityBias);
      updateCallback({ objectivityBias });
      return objectivityBias;
    }),
  ]).catch((error) => {
    console.error("Error analyzing article:", error);
  });

  // Analyze journalists
  analyzeJournalists({ articleId: articleResp.article.id })
    .then((journalistsAnalysis) => {
      console.log("Journalists Analysis", journalistsAnalysis);
      updateCallback({ journalistsAnalysis });
      logEvent("journalists_analyzed", { journalists: journalistsAnalysis });
    })
    .catch((error) => {
      console.error("Error analyzing journalists:", error);
    });

  // Analyze publication
  analyzePublication({ publicationId: articleResp.article.publication })
    .then((publicationAnalysis) => {
      console.log("Publication Analysis", publicationAnalysis);
      updateCallback({ publicationAnalysis });
      logEvent("publication_analyzed", { publication: publicationAnalysis });
    })
    .catch((error) => {
      console.error("Error analyzing publication:", error);
    });

  // Save the final app state to chrome storage
  chrome.storage.local.set({ appState: await getFullAppState() }, () => {
    console.info("App state is saved.");
  });
};

// Helper function to get the full app state
const getFullAppState = async (): Promise<AppStateType> => {
  return new Promise((resolve) => {
    chrome.storage.local.get(["appState"], (result) => {
      resolve(result.appState as AppStateType);
    });
  });
};
