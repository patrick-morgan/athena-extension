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

type QuickParseArticleResponse = {
  article: ArticleModel;
  journalists: JournalistsModel[];
  publication: PublicationModel | null;
};

export const quickParseArticle = async (payload: {
  url: string;
  hostname: string;
  htmlSubset: string;
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

// import {
//   analyzeJournalists,
//   analyzeObjectivity,
//   analyzePoliticalBias,
//   analyzePublication,
//   fullParseArticle,
//   generateSummary,
//   PublicationAnalysisResponse,
//   quickParseArticle,
// } from "@/api/api";
// import { cleanHTML } from "@/parsers/genericParser";
// import {
//   ArticleModel,
//   JournalistBiasWithNameModel,
//   JournalistsModel,
//   ObjectivityBiasResponseType,
//   PoliticalBiasResponseType,
//   PublicationModel,
//   SummaryModel,
// } from "@/types";
// import { logEvent } from "../../analytics";
// import { requestContent } from "./utils";

// export type AppStateType = {
//   currentUrl: string;
//   article: ArticleModel | null;
//   publication: PublicationModel | null;
//   journalists: JournalistsModel[] | null;
//   summary: SummaryModel | null;
//   politicalBias: PoliticalBiasResponseType | null;
//   objectivityBias: ObjectivityBiasResponseType | null;
//   journalistsAnalysis: JournalistBiasWithNameModel[] | null;
//   publicationAnalysis: PublicationAnalysisResponse | null;
//   error: string | null;
// };

// export const handleAnalysis = async (
//   updateCallback: (partialState: Partial<AppStateType>) => void
// ): Promise<void> => {
//   let currentState: Partial<AppStateType> = {};

//   const updateState = (partialState: Partial<AppStateType>) => {
//     currentState = { ...currentState, ...partialState };
//     updateCallback(partialState);
//     chrome.storage.local.set({ appState: currentState }, () => {
//       console.info("App state updated and saved.");
//     });
//   };

//   try {
//     const resp = await requestContent();
//     const html = resp?.html;
//     const url = resp?.url;

//     if (!html || !url) {
//       throw new Error("Error fetching website content");
//     }
//     const hostname = new URL(url).hostname;

//     const cleanedHTML = cleanHTML(html);
//     console.log("Cleaned HTML", cleanedHTML);
//     logEvent("cleaned_html", { cleanedHTML });

//     // Quick parse
//     const quickParseResp = await quickParseArticle({
//       url,
//       hostname,
//       htmlSubset: cleanedHTML.substring(0, 1000), // Adjust the length as needed
//     });

//     console.log("quick Parse Resp", quickParseResp);
//     if (!quickParseResp) {
//       throw new Error("Error quick parsing article");
//     }

//     // Update with initial article info
//     updateState({
//       currentUrl: url,
//       article: quickParseResp.article,
//       journalists: quickParseResp.journalists,
//       publication: quickParseResp.publication,
//     });

//     // Fetch publication metadata
//     // const hostname = new URL(url).hostname;
//     // const publicationMetadata = await fetchPublicationMetadata({ hostname });
//     // console.log("Publication Metadata", publicationMetadata);
//     // Update state with publication metadata
//     // if (publicationMetadata) {
//     //   updateState({
//     //     publication: publicationMetadata,
//     //   });
//     // }

//     // Full parse (in parallel with other operations)
//     const fullParse = await fullParseArticle({ url, html: cleanedHTML });

//     // const fullParse = await fullParseArticle({ url, html: cleanedHTML });
//     console.log("Full Parse", fullParse);

//     if (!fullParse) {
//       console.error("Error full parsing article");
//       throw new Error("Error full parsing article, please try again");
//     }

//     console.log("full response", fullParse);
//     updateState({
//       article: fullParse.article,
//       publication: fullParse.publication,
//       journalists: fullParse.journalists,
//     });

//     // Analyze article section
//     // Execute API calls in parallel and update as they complete
//     const { id, text, title } = quickParseResp.article;

//     // await Promise.all([
//     // generateSummary({
//     //   id,
//     //   text: text || "",
//     // }).then((summary) => {
//     //   console.log("Summary", summary);
//     //   logEvent("summary_analyzed", { summary });
//     //   updateState({ summary });
//     // }),

//     //   analyzePoliticalBias({
//     //     id,
//     //     text: text || "",
//     //   }).then((politicalBias) => {
//     //     console.log("Political Bias", politicalBias);
//     //     logEvent("political_analyzed", { politicalBias });
//     //     updateState({ politicalBias });
//     //   }),

//     //   analyzeObjectivity({
//     //     id,
//     //     text: text || "",
//     //   }).then((objectivityBias) => {
//     //     console.log("Objectivity Bias", objectivityBias);
//     //     logEvent("objectivity_analyzed", { objectivity: objectivityBias });
//     //     updateState({ objectivityBias });
//     //   }),
//     // ]);

//     const [summary, politicalBias, objectivityBias] = await Promise.all([
//       // fullParse,
//       generateSummary({
//         id,
//         text: text || "",
//       }),
//       analyzePoliticalBias({
//         id,
//         text: text || "",
//       }),
//       analyzeObjectivity({
//         id,
//         text: text || "",
//       }),
//     ]);

//     console.log("Summary", summary);
//     logEvent("summary_analyzed", { summary });
//     updateState({ summary });

//     console.log("Political Bias", politicalBias);
//     logEvent("political_analyzed", { politicalBias });
//     updateState({ politicalBias });

//     console.log("Objectivity Bias", objectivityBias);
//     logEvent("objectivity_analyzed", { objectivity: objectivityBias });
//     updateState({ objectivityBias });

//     // Analyze journalists
//     const journalistsAnalysis = await analyzeJournalists({
//       articleId: id,
//     });
//     console.log("Journalists Analysis", journalistsAnalysis);
//     updateState({ journalistsAnalysis });
//     logEvent("journalists_analyzed", { journalists: journalistsAnalysis });

//     // Analyze publication
//     const publicationAnalysis = await analyzePublication({
//       publicationId: fullParse.publication.id,
//       // publicationId: fullParseResp
//       //   ? fullParseResp.article.publication
//       //   : quickParseResp.publication,
//     });
//     console.log("Publication Analysis", publicationAnalysis);
//     updateState({ publicationAnalysis });
//     logEvent("publication_analyzed", { publication: publicationAnalysis });

//     console.log("Final app state:", currentState);
//   } catch (error) {
//     console.error("Error during analysis:", error);
//     updateState({ error: (error as Error).message });
//   }
// };

// import {
//   analyzeJournalists,
//   analyzeObjectivity,
//   analyzePoliticalBias,
//   analyzePublication,
//   fetchPublicationMetadata,
//   fullParseArticle,
//   generateSummary,
//   PublicationAnalysisResponse,
//   quickParseArticle,
// } from "@/api/api";
// import { cleanHTML } from "@/parsers/genericParser";
// import {
//   ArticleModel,
//   JournalistBiasWithNameModel,
//   JournalistsModel,
//   ObjectivityBiasResponseType,
//   PoliticalBiasResponseType,
//   PublicationModel,
//   SummaryModel,
// } from "@/types";
// import { logEvent } from "../../analytics";
// import { requestContent } from "./utils";

// export type AppStateType = {
//   currentUrl: string;
//   article: ArticleModel | null;
//   publication: PublicationModel | null;
//   journalists: JournalistsModel[] | null;
//   summary: SummaryModel | null;
//   politicalBias: PoliticalBiasResponseType | null;
//   objectivityBias: ObjectivityBiasResponseType | null;
//   journalistsAnalysis: JournalistBiasWithNameModel[] | null;
//   publicationAnalysis: PublicationAnalysisResponse | null;
//   error: string | null;
// };

// export const handleAnalysis = async (
//   updateCallback: (partialState: Partial<AppStateType>) => void
// ): Promise<void> => {
//   let currentState: Partial<AppStateType> = {};

//   const updateState = (partialState: Partial<AppStateType>) => {
//     currentState = { ...currentState, ...partialState };
//     updateCallback(partialState);
//     chrome.storage.local.set({ appState: currentState }, () => {
//       console.info("App state updated and saved.");
//     });
//   };

//   try {
//     const resp = await requestContent();
//     const html = resp?.html;
//     const url = resp?.url;

//     if (!html || !url) {
//       throw new Error("Error fetching website content");
//     }
//     const hostname = new URL(url).hostname;

//     const cleanedHTML = cleanHTML(html);
//     console.log("Cleaned HTML", cleanedHTML);
//     logEvent("cleaned_html", { cleanedHTML });

//     // Quick parse
//     const quickParseResp = await quickParseArticle({
//       url,
//       hostname,
//       htmlSubset: cleanedHTML.substring(0, 1000), // Adjust the length as needed
//     });

//     console.log("quick Parse Resp", quickParseResp);
//     if (!quickParseResp) {
//       throw new Error("Error quick parsing article");
//     }

//     // Update with initial article info
//     updateState({
//       currentUrl: url,
//       article: quickParseResp.article,
//       journalists: quickParseResp.journalists,
//       publication: quickParseResp.publication,
//     });

//     // Fetch publication metadata
//     // const hostname = new URL(url).hostname;
//     // const publicationMetadata = await fetchPublicationMetadata({ hostname });
//     // console.log("Publication Metadata", publicationMetadata);
//     // Update state with publication metadata
//     // if (publicationMetadata) {
//     //   updateState({
//     //     publication: publicationMetadata,
//     //   });
//     // }

//     // Full parse (in parallel with other operations)
//     const fullParsePromise = fullParseArticle({ url, html: cleanedHTML });
//     console.log("Full Parse Promise", fullParsePromise);

//     // Analyze article section
//     // Execute API calls in parallel and update as they complete
//     const { id, text, title } = quickParseResp.article;
//     const [fullParseResp, summary, politicalBias, objectivityBias] =
//       await Promise.all([
//         fullParsePromise,
//         generateSummary({
//           id,
//           text: text || "",
//         }),
//         analyzePoliticalBias({
//           id,
//           text: text || "",
//         }),
//         analyzeObjectivity({
//           id,
//           text: text || "",
//         }),
//       ]);

//     if (!fullParseResp) {
//       console.error("Error full parsing article");
//       throw new Error("Error full parsing article, please try again");
//     }

//     if (fullParseResp) {
//       console.log("full response", fullParseResp);
//       updateState({
//         article: fullParseResp.article,
//         // publication: fullParseResp.publication,
//         journalists: fullParseResp.article.article_authors,
//       });
//     }

//     console.log("Summary", summary);
//     logEvent("summary_analyzed", { summary });
//     updateState({ summary });

//     console.log("Political Bias", politicalBias);
//     logEvent("political_analyzed", { politicalBias });
//     updateState({ politicalBias });

//     console.log("Objectivity Bias", objectivityBias);
//     logEvent("objectivity_analyzed", { objectivity: objectivityBias });
//     updateState({ objectivityBias });

//     // Analyze journalists
//     const journalistsAnalysis = await analyzeJournalists({
//       articleId: id,
//     });
//     console.log("Journalists Analysis", journalistsAnalysis);
//     updateState({ journalistsAnalysis });
//     logEvent("journalists_analyzed", { journalists: journalistsAnalysis });

//     // Analyze publication
//     const publicationAnalysis = await analyzePublication({
//       publicationId: fullParseResp.publication.id,
//       // publicationId: fullParseResp
//       //   ? fullParseResp.article.publication
//       //   : quickParseResp.publication,
//     });
//     console.log("Publication Analysis", publicationAnalysis);
//     updateState({ publicationAnalysis });
//     logEvent("publication_analyzed", { publication: publicationAnalysis });

//     console.log("Final app state:", currentState);
//   } catch (error) {
//     console.error("Error during analysis:", error);
//     updateState({ error: (error as Error).message });
//   }
// };
