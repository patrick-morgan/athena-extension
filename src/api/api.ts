import axios from "axios";
import {
  ObjectivityBiasResponseType,
  PoliticalBiasResponseType,
  SummaryResponseType,
} from "../types";

const API_URL = "http://localhost:3000"; // Update with server URL

export const getArticles = async () => {
  const response = await axios.get(`${API_URL}/articles`);
  return response.data;
};

export const createArticle = async (article: any) => {
  const response = await axios.post(`${API_URL}/articles`, article);
  return response.data;
};

// Add other CRUD functions as needed
export const generateSummary = async (
  articleContent: string
): Promise<SummaryResponseType | null> => {
  try {
    const response = await axios.post(`${API_URL}/generate-summary`, {
      articleContent,
    });
    return response.data;
  } catch (error) {
    console.error("Error generating summary:", error);
    return null;
  }
};

export const analyzePoliticalBias = async (
  articleContent: string
): Promise<PoliticalBiasResponseType | null> => {
  try {
    const response = await axios.post(`${API_URL}/analyze-political-bias`, {
      articleContent,
    });
    return response.data;
  } catch (error) {
    console.error("Error generating political bias:", error);
    return null;
  }
};

export const analyzeObjectivity = async (
  articleContent: string
): Promise<ObjectivityBiasResponseType | null> => {
  try {
    const response = await axios.post(`${API_URL}/analyze-objectivity`, {
      articleContent,
    });
    return response.data;
  } catch (error) {
    console.error("Error generating objectivity:", error);
    return null;
  }
};
