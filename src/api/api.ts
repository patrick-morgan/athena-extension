import axios from "axios";
import {
  ArticleModel,
  JournalistBiasWithNameModel,
  ObjectivityBiasResponseType,
  PoliticalBiasResponseType,
  PublicationBiasModel,
  PublicationModel,
  SummaryModel,
} from "../types";

const API_URL = "http://localhost:3000"; // Update with server URL

export const getArticles = async () => {
  const response = await axios.get(`${API_URL}/articles`);
  return response.data;
};

type CreateArticlePayload = {
  url: string;
  html: string;
};

export const createArticle = async (
  payload: CreateArticlePayload
): Promise<ArticleModel> => {
  const response = await axios.post(`${API_URL}/articles`, payload);
  return response.data;
};

type AnalyzeJournalistsPayload = {
  articleId: string;
};

export const analyzeJournalists = async (
  articleId: AnalyzeJournalistsPayload
): Promise<JournalistBiasWithNameModel[]> => {
  const response = await axios.post(
    `${API_URL}/analyze-journalists`,
    articleId
  );
  return response.data;
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
  const response = await axios.post(`${API_URL}/analyze-publication`, payload);
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
    const response = await axios.post(
      `${API_URL}/generate-summary`,
      articlePayload
    );
    return response.data;
  } catch (error) {
    console.error("Error generating summary:", error);
    return null;
  }
};

export const analyzePoliticalBias = async (
  articlePayload: ArticlePayload
): Promise<PoliticalBiasResponseType | null> => {
  try {
    const response = await axios.post(
      `${API_URL}/analyze-political-bias`,
      articlePayload
    );
    return response.data;
  } catch (error) {
    console.error("Error generating political bias:", error);
    return null;
  }
};

export const analyzeObjectivity = async (
  articlePayload: ArticlePayload
): Promise<ObjectivityBiasResponseType | null> => {
  try {
    const response = await axios.post(
      `${API_URL}/analyze-objectivity`,
      articlePayload
    );
    return response.data;
  } catch (error) {
    console.error("Error generating objectivity:", error);
    return null;
  }
};
