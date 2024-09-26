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
  error: string | null;
};

export const handleAnalysis = async (
  updateCallback: (partialState: Partial<AppStateType>) => void
): Promise<void> => {
  let currentState: Partial<AppStateType> = {};

  const updateState = (partialState: Partial<AppStateType>) => {
    currentState = { ...currentState, ...partialState };
    updateCallback(partialState);
    chrome.storage.local.set({ appState: currentState }, () => {
      console.info("App state updated and saved.");
    });
  };

  try {
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
    updateState({
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
    await Promise.all([
      generateSummary(payload).then((summary) => {
        console.log("Summary", summary);
        logEvent("summary_analyzed", { summary });
        updateState({ summary });
        return summary;
      }),
      analyzePoliticalBias(payload).then((politicalBias) => {
        console.log("Political Bias", politicalBias);
        logEvent("political_analyzed", { politicalBias });
        updateState({ politicalBias });
        return politicalBias;
      }),
      analyzeObjectivity(payload).then((objectivityBias) => {
        console.log("Objectivity Bias", objectivityBias);
        logEvent("objectivity_analyzed", { objectivity: objectivityBias });
        updateState({ objectivityBias });
        return objectivityBias;
      }),
    ]);

    // Analyze journalists
    const journalistsAnalysis = await analyzeJournalists({
      articleId: articleResp.article.id,
    });
    console.log("Journalists Analysis", journalistsAnalysis);
    updateState({ journalistsAnalysis });
    logEvent("journalists_analyzed", { journalists: journalistsAnalysis });

    // Analyze publication
    const publicationAnalysis = await analyzePublication({
      publicationId: articleResp.article.publication,
    });
    console.log("Publication Analysis", publicationAnalysis);
    updateState({ publicationAnalysis });
    logEvent("publication_analyzed", { publication: publicationAnalysis });

    console.log("Final app state:", currentState);
  } catch (error) {
    console.error("Error during analysis:", error);
    updateState({ error: (error as Error).message });
  }
};
