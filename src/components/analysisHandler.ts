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

export type AppStateType = {
  currentUrl: string;
  article: ArticleModel;
  publication: PublicationModel;
  journalists: JournalistsModel[];
  summary: SummaryModel;
  politicalBias: PoliticalBiasResponseType;
  objectivityBias: ObjectivityBiasResponseType;
  journalistsAnalysis: JournalistBiasWithNameModel[] | null;
  publicationAnalysis: PublicationAnalysisResponse | null;
};

export const handleAnalysis = async (): Promise<AppStateType> => {
  const resp = await requestContent();
  const html = resp?.html;
  const url = resp?.url;

  if (!html || !url) {
    throw new Error("Error fetching website content");
  }

  const cleanedHTML = cleanHTML(html);
  // console.log("Cleaned HTML", cleanedHTML);

  // Create article
  const articleResp = await createArticle({ url, html: cleanedHTML });

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

  if (!summary || !politicalBias || !objectivityScore) {
    throw new Error("Error analyzing article");
  }

  // Analyze journalists
  const journalistAnalysis = await analyzeJournalists({
    articleId: articleResp.article.id,
  });

  // Analyze publication
  const pubAnalysis = await analyzePublication({
    publicationId: articleResp.article.publication,
  });

  // Construct and return the app state
  const appState: AppStateType = {
    currentUrl: url,
    article: articleResp.article,
    publication: articleResp.publication,
    journalists: articleResp.journalists,
    summary,
    politicalBias,
    objectivityBias: objectivityScore,
    journalistsAnalysis: journalistAnalysis,
    publicationAnalysis: pubAnalysis,
  };

  // Save the app state to chrome storage
  chrome.storage.local.set({ appState }, () => {
    console.info("App state is saved.");
  });

  return appState;
};
