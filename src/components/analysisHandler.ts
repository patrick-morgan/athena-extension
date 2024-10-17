import {
  analyzeJournalists,
  analyzePublication,
  // checkDateUpdated,
  PublicationAnalysisResponse,
  quickParseArticle,
} from "@/api/api";
import { cleanHTML } from "@/parsers/genericParser";
import {
  ArticleModel,
  JournalistBiasWithNameModel,
  JournalistsModel,
  // ObjectivityBiasResponseType,
  // PoliticalBiasResponseType,
  PublicationModel,
} from "@/types";
import { logEvent } from "../../analytics";
import { requestContent } from "./utils";

export type AppStateType = {
  currentUrl: string;
  article: ArticleModel | null;
  publication: PublicationModel | null;
  journalists: JournalistsModel[] | null;
  // summary: SummaryModel | null;
  summary: string | null;
  politicalBiasScore: number | null;
  objectivityBiasScore: number | null;
  // politicalBias: PoliticalBiasResponseType | null;
  // objectivityBias: ObjectivityBiasResponseType | null;
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
    const hostname = new URL(url).hostname;

    const { head, body, html: cleanedHtml } = cleanHTML(html);
    console.log("Cleaned Body", body);
    console.log("Cleaned Head", head);
    console.log("Cleaned Html", cleanedHtml);
    logEvent("cleaned_html", { body, head, cleanedHtml });

    // Check if the article needs updating
    // const dateUpdatedResp = await checkDateUpdated({
    //   url,
    //   head,
    //   body,
    // });

    // console.log("Date Updated Resp", dateUpdatedResp);

    // if (
    //   dateUpdatedResp &&
    //   dateUpdatedResp.article &&
    //   !dateUpdatedResp.needsUpdate
    // ) {
    //   // Article exists and doesn't need updating
    //   console.log("Article exists and doesn't need updating");
    //   console.log(
    //     "date updated setting journalists",
    //     dateUpdatedResp.journalists
    //   );
    //   updateState({
    //     currentUrl: url,
    //     article: dateUpdatedResp.article,
    //     journalists: dateUpdatedResp.journalists,
    //     publication: dateUpdatedResp.article.publicationObject,
    //     summary: dateUpdatedResp.summary,
    //     politicalBiasScore: dateUpdatedResp.political_bias_score,
    //     objectivityBiasScore: dateUpdatedResp.objectivity_score,
    //   });

    //   // Fetch journalists
    //   const journalistsAnalysis = await analyzeJournalists({
    //     articleId: dateUpdatedResp.article.id,
    //   });
    //   console.log("Journalists Analysis", journalistsAnalysis);
    //   updateState({ journalistsAnalysis });
    //   logEvent("journalists_analyzed", { journalists: journalistsAnalysis });

    //   // Fetch publication
    //   const publicationAnalysis = await analyzePublication({
    //     publicationId: dateUpdatedResp.article.publicationObject.id,
    //   });
    //   console.log("Publication Analysis", publicationAnalysis);
    //   updateState({ publicationAnalysis });
    //   logEvent("publication_analyzed", { publication: publicationAnalysis });

    //   return; // Exit early as we don't need to re-parse
    // }

    // console.log("Article needs updating");
    // If we reach here, we either need to create a new article or update an existing one
    const quickParseResp = await quickParseArticle({
      url,
      hostname,
      head,
      body,
      // htmlSubset: cleanedHTML.substring(0, 1000), // Adjust the length as needed
    });

    console.log("quick Parse Resp", quickParseResp);
    if (!quickParseResp) {
      throw new Error("Error quick parsing article");
    }

    console.log("setting quick parse jorunalists", quickParseResp.journalists);

    // Update with initial article info
    updateState({
      currentUrl: url,
      article: quickParseResp.article,
      journalists: quickParseResp.journalists,
      publication: quickParseResp.publication,
      summary: quickParseResp.summary,
      politicalBiasScore: quickParseResp.political_bias_score,
      objectivityBiasScore: quickParseResp.objectivity_score,
    });

    const { id } = quickParseResp.article;

    // Analyze journalists
    const journalistsAnalysis = await analyzeJournalists({
      articleId: id,
    });
    console.log("Journalists Analysis", journalistsAnalysis);
    updateState({ journalistsAnalysis });
    logEvent("journalists_analyzed", { journalists: journalistsAnalysis });

    // Analyze publication
    const publicationAnalysis = await analyzePublication({
      publicationId: quickParseResp.publication.id,
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
