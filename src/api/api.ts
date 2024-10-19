import {
  ArticleModel,
  JournalistBiasWithNameModel,
  JournalistsModel,
  ObjectivityBiasResponseType,
  PoliticalBiasResponseType,
  PublicationBiasModel,
  PublicationModel,
  SummaryModel,
} from "../types";
import axiosInstance from "./axiosInstance";
import { logEvent } from "../../analytics";

export const getArticles = async () => {
  const response = await axiosInstance.get(`/articles`);
  return response.data;
};

// type CreateArticlePayload = {
//   url: string;
//   html: string;
// };

type CreateArticleResponse = {
  article: ArticleModel;
  publication: PublicationModel;
  journalists: JournalistsModel[];
};

// export const createArticle = async (
//   payload: CreateArticlePayload
// ): Promise<CreateArticleResponse | null> => {
//   try {
//     const response = await axiosInstance.post(`/articles`, payload);
//     logEvent("article_created", { article: response.data });
//     return response.data;
//   } catch (error) {
//     console.error("Error creating article:", error);
//     logEvent("article_error", { error: error });
//     return null;
//   }
// };

export const fetchArticleByUrl = async (
  url: string
): Promise<{
  article: ArticleModel;
  summary: string;
  journalists: JournalistsModel[];
  political_bias_score: number;
  objectivity_score: number;
  journalistsAnalysis: JournalistBiasWithNameModel[];
  publicationAnalysis: PublicationAnalysisResponse;
} | null> => {
  try {
    const response = await axiosInstance.get(`/articles/by-url`, {
      params: { url },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching article by URL:", error);
    return null;
  }
};

type DateUpdatedResponse = {
  // article: ArticleModel | null;
  needsUpdate: boolean;
  // journalists: JournalistsModel[];
  // summary: string | null;
  // political_bias_score: number | null;
  // objectivity_score: number | null;
};

export const checkDateUpdated = async (payload: {
  url: string;
  head: string;
  body: string;
}): Promise<DateUpdatedResponse | null> => {
  try {
    const response = await axiosInstance.post(
      `/articles/date-updated`,
      payload
    );
    logEvent("date_updated_checked", { response: response.data });
    return response.data;
  } catch (error) {
    console.error("Error checking date updated:", error);
    logEvent("date_updated_error", { error: error });
    return null;
  }
};

type QuickParseArticleResponse = {
  article: ArticleModel;
  journalists: JournalistsModel[];
  publication: PublicationModel;
  summary: string;
  political_bias_score: number;
  objectivity_score: number;
};

export const quickParseArticle = async (payload: {
  url: string;
  hostname: string;
  head: string;
  body: string;
  // htmlSubset: string;
}): Promise<QuickParseArticleResponse | null> => {
  try {
    const response = await axiosInstance.post(`/articles/quick-parse`, payload);
    logEvent("article_quick_parsed", { article: response.data });
    return response.data;
  } catch (error) {
    console.error("Error quick parsing article:", error);
    logEvent("quick_parse_error", { error: error });
    return null;
  }
};

export const fullParseArticle = async (payload: {
  url: string;
  html: string;
}): Promise<CreateArticleResponse | null> => {
  try {
    const response = await axiosInstance.post(`/articles/full-parse`, payload);
    logEvent("article_full_parsed", { article: response.data });
    return response.data;
  } catch (error) {
    console.error("Error full parsing article:", error);
    logEvent("full_parse_error", { error: error });
    return null;
  }
};

export const fetchPublicationMetadata = async (payload: {
  hostname: string;
}): Promise<PublicationModel | null> => {
  try {
    const response = await axiosInstance.post(`/publication-metadata`, payload);
    logEvent("publication_metadata_fetched", { metadata: response.data });
    return response.data;
  } catch (error) {
    console.error("Error fetching publication metadata:", error);
    logEvent("publication_metadata_error", { error: error });
    return null;
  }
};

type AnalyzeJournalistsPayload = {
  articleId: string;
};

export const analyzeJournalists = async (
  articleId: AnalyzeJournalistsPayload
): Promise<JournalistBiasWithNameModel[]> => {
  try {
    const response = await axiosInstance.post(
      `/analyze-journalists`,
      articleId
    );
    logEvent("journalists_analyzed", { journalists: response.data });
    return response.data;
  } catch (error) {
    console.error("Error analyzing journalists:", error);
    logEvent("journalists_error", { error: error });
    return [];
  }
};

type AnalyzeJournalistPayload = {
  journalistId: string;
};

export const analyzeJournalist = async (
  journalistId: AnalyzeJournalistPayload
): Promise<JournalistBiasWithNameModel | null> => {
  try {
    const response = await axiosInstance.post(
      `/analyze-journalist`,
      journalistId
    );
    logEvent("journalist_analyzed", { journalist: response.data });
    return response.data;
  } catch (error) {
    console.error("Error analyzing journalists:", error);
    logEvent("journalists_error", { error: error });
    return null;
  }
};

type PublicationBiasPayload = {
  publicationId: string;
};

export type PublicationAnalysisResponse = {
  publication: PublicationModel;
  analysis: PublicationBiasModel;
};

export const analyzePublication = async (
  payload: PublicationBiasPayload
): Promise<PublicationAnalysisResponse> => {
  const response = await axiosInstance.post(`/analyze-publication`, payload);
  return response.data;
};

export type ArticlePayload = {
  id: string;
  text: string;
};

// Add other CRUD functions as needed
export const generateSummary = async (
  articlePayload: ArticlePayload
): Promise<SummaryModel | null> => {
  try {
    console.log("calling gen sumary", articlePayload);
    const response = await axiosInstance.post(
      `/generate-summary`,
      articlePayload
    );
    logEvent("summary_generated", { summary: response.data });
    return response.data;
  } catch (error) {
    console.error("Error generating summary:", error);
    logEvent("summary_error", { error: error });
    return null;
  }
};

export const analyzePoliticalBias = async (
  articlePayload: ArticlePayload
): Promise<PoliticalBiasResponseType | null> => {
  try {
    const response = await axiosInstance.post(
      `/analyze-political-bias`,
      articlePayload
    );
    logEvent("political_bias_generated", {
      political_bias: response.data,
    });
    return response.data;
  } catch (error) {
    console.error("Error generating political bias:", error);
    logEvent("political_bias_error", { error: error });
    return null;
  }
};

export const analyzeObjectivity = async (
  articlePayload: ArticlePayload
): Promise<ObjectivityBiasResponseType | null> => {
  try {
    const response = await axiosInstance.post(
      `/analyze-objectivity`,
      articlePayload
    );
    logEvent("objectivity_generated", { objectivity: response.data });
    return response.data;
  } catch (error) {
    console.error("Error generating objectivity:", error);
    logEvent("objectivity_error", { error: error });
    return null;
  }
};

type JournalistArticlesResponse = {
  articles: ArticleModel[];
};

export const getJournalistArticles = async (
  journalistId: string
): Promise<JournalistArticlesResponse | null> => {
  try {
    const response = await axiosInstance.get(
      `/journalists/${journalistId}/articles`
    );
    logEvent("journalists_articles", { journalistId, articles: response.data });
    return response.data;
  } catch (error) {
    console.error("Error getting journalists articles:", error);
    logEvent("get_journalists_articles_error", { error: error });
    return null;
  }
};

type PublicationArticlesResponse = {
  articles: ArticleModel[];
};

export const getPublicationArticles = async (
  publicationId: string
): Promise<PublicationArticlesResponse | null> => {
  try {
    const response = await axiosInstance.get(
      `/publications/${publicationId}/articles`
    );
    logEvent("publication_articles_fetched", {
      publicationId,
      articles: response.data,
    });
    return response.data;
  } catch (error) {
    console.error("Error getting publication articles:", error);
    logEvent("get_publication_articles_error", { error: error, publicationId });
    return null;
  }
};
