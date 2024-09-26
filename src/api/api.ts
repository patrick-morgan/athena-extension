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

type CreateArticlePayload = {
  url: string;
  html: string;
};

type CreateArticleResponse = {
  article: ArticleModel;
  publication: PublicationModel;
  journalists: JournalistsModel[];
};

export const createArticle = async (
  payload: CreateArticlePayload
): Promise<CreateArticleResponse | null> => {
  try {
    const response = await axiosInstance.post(`/articles`, payload);
    logEvent("article_created", { article: response.data });
    return response.data;
  } catch (error) {
    console.error("Error creating article:", error);
    logEvent("article_error", { error: error });
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
