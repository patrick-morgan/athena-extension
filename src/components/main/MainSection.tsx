import React, { useState } from "react";
import { AnalyzeArticle } from "../AnalyzeArticle";
import { AnalyzeButton } from "../buttons/AnalyzeButton";
import { getParser } from "../../parsers/parsers";
import { SummarySection } from "../SummarySection";
import { ArticleSection } from "../ArticleSection";
import {
  MessageContentType,
  ObjectivityBiasResponseType,
  PoliticalBiasResponseType,
  SummaryResponseType,
} from "../../types";
import {
  ArticlePayload,
  analyzeObjectivity,
  analyzePoliticalBias,
  createArticle,
  generateSummary,
} from "../../api/api";

type BodySectionProps = {
  analyzing: boolean;
  setAnalyzing: (analyzing: boolean) => void;
  currentUrl: string | null;
  websiteHTML: string | null;
  requestContent: () => Promise<MessageContentType | undefined>;
  // error: string | null;
  // summary: SummaryResponseType | null;
  // politicalBias: PoliticalBiasResponseType | null;
  // objectivityBias: ObjectivityBiasResponseType | null;
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
  const [summary, setSummary] = useState<SummaryResponseType | null>(null);
  const [politicalBias, setPoliticalBias] =
    useState<PoliticalBiasResponseType | null>(null);
  const [objectivityBias, setObjectivityBias] =
    useState<ObjectivityBiasResponseType | null>(null);

  const handleAnalsis = async () => {
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

      console.log("payload to send off", payload);
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

      setSummary({
        summary: summary.summary,
        footnotes: summary.footnotes,
      });
      setPoliticalBias(politicalBias);
      setObjectivityBias(objectivityScore);
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
            handleAnalsis();
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
    </div>
  );
};
