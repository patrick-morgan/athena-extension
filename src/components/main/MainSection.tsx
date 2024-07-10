import React, { useState } from "react";
import { AnalyzeArticle } from "../AnalyzeArticle";
import { AnalyzeButton } from "../buttons/AnalyzeButton";
import { getParser } from "../../parsers/parsers";
import { SummarySection } from "../summary-section/SummarySection";
import { ArticleSection } from "../article-section/ArticleSection";
import {
  JournalistBiasWithNameModel,
  MessageContentType,
  ObjectivityBiasResponseType,
  PoliticalBiasResponseType,
  PublicationBiasModel,
  SummaryModel,
  SummaryResponseType,
} from "../../types";
import {
  ArticlePayload,
  PublicationAnalysisResponse,
  analyzeJournalists,
  analyzeObjectivity,
  analyzePoliticalBias,
  analyzePublication,
  createArticle,
  generateSummary,
} from "../../api/api";
import { JournalistSection } from "../journalist-section/JournalistSection";
import { PublicationSection } from "../publication-section/PublicationSection";

type BodySectionProps = {
  analyzing: boolean;
  setAnalyzing: (analyzing: boolean) => void;
  currentUrl: string | null;
  websiteHTML: string | null;
  requestContent: () => Promise<MessageContentType | undefined>;
};

export const MainSection = ({
  analyzing,
  setAnalyzing,
  currentUrl,
  websiteHTML,
  requestContent,
}: BodySectionProps) => {
  // const [currentUrl, setCurrentUrl] = useState<string>("");
  const [error, setError] = useState<string | null>(null);
  const [summary, setSummary] = useState<SummaryModel | null>(null);
  const [politicalBias, setPoliticalBias] =
    useState<PoliticalBiasResponseType | null>(null);
  const [objectivityBias, setObjectivityBias] =
    useState<ObjectivityBiasResponseType | null>(null);
  const [journalistsAnalysis, setJournalistsAnalysis] = useState<
    JournalistBiasWithNameModel[] | null
  >(null);
  const [publicationAnalysis, setPublicationAnalysis] =
    useState<PublicationAnalysisResponse | null>(null);

  const handleAnalysis = async () => {
    console.log("current url", currentUrl);
    console.log("htnl", websiteHTML);
    let newHTML: string | null | undefined = websiteHTML;
    let newURL: string | null | undefined = currentUrl;
    if (!websiteHTML || !currentUrl) {
      const resp = await requestContent();
      newHTML = resp?.html;
      newURL = resp?.url;
    }
    if (!newHTML) {
      setError("Error fetching website content");
      console.error("Error manually requesting HTML");
      return;
    }
    if (!newURL) {
      setError("Error fetching website content");
      console.error("Error manually requesting URL");
      return;
    }
    const parser = getParser(newURL, newHTML);
    const articleData = parser.parse();

    console.log("articleData", articleData);
    if (!articleData.text) {
      console.error("No article data found");
      return;
    }

    try {
      // Create article
      const article = await createArticle(articleData);

      const payload: ArticlePayload = {
        id: article.id,
        text: articleData.text,
      };

      // Analyze article section
      // Execute API calls in parallel
      const [summary, politicalBias, objectivityScore] = await Promise.all([
        generateSummary(payload),
        analyzePoliticalBias(payload),
        analyzeObjectivity(payload),
      ]);

      console.log("Summary:", summary);
      console.log("Political Bias:", politicalBias);
      console.log("Objectivity Score:", objectivityScore);

      if (!summary || !politicalBias || !objectivityScore) {
        setError("Error analyzing article");
        return;
      }

      setSummary(summary);
      setPoliticalBias(politicalBias);
      setObjectivityBias(objectivityScore);
      setAnalyzing(false);

      // Analyze journalists
      const journalistAnalysis = await analyzeJournalists(articleData);
      console.log("Journalists Analysis:", journalistAnalysis);
      setJournalistsAnalysis(journalistAnalysis);

      // Analyze publication
      const pubAnalysis = await analyzePublication({
        publicationId: article.publication,
      });
      console.log("Publication Analysis:", pubAnalysis);
      setPublicationAnalysis(pubAnalysis);
    } catch (error) {
      console.error("Error executing API calls:", error);
      setError("Error analyzing article");
    } finally {
      setAnalyzing(false);
    }
  };

  // For when i add displaying of title and date:
  // Display the date in a readable format with time zone
  // const formattedDate = formatDate(parsedDate, 'America/New_York');

  if (error) {
    return (
      <div className="text-red-500 flex justify-start items-center">
        {error}
      </div>
    );
  }
  if (analyzing || !summary || !politicalBias || !objectivityBias) {
    return (
      <div className="w-full h-full flex gap-4 flex-col mt-8 justify-start items-center">
        <AnalyzeArticle />
        <AnalyzeButton
          analyzing={analyzing}
          onClick={() => {
            setAnalyzing(true);
            handleAnalysis();
          }}
        />
      </div>
    );
  }

  return (
    <div className="w-full h-full pt-4 flex gap-4 flex-col justify-start items-center">
      <SummarySection summaryResponse={summary} />
      <ArticleSection
        politicalBias={politicalBias}
        objectivityBias={objectivityBias}
      />
      {journalistsAnalysis && (
        <JournalistSection journalistsBias={journalistsAnalysis} />
      )}
      {publicationAnalysis && (
        <PublicationSection pubResponse={publicationAnalysis} />
      )}
    </div>
  );
};
