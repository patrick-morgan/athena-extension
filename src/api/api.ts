import axios from "axios";
import { SummaryResponseType } from "../types";

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
