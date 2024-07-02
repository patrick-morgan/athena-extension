import React, { useState } from "react";
import {
  ObjectivityBiasResponseType,
  PoliticalBiasResponseType,
  SummaryResponseType,
} from "../../api/prompts";
import { AnalyzeArticle } from "../AnalyzeArticle";
import { AnalyzeButton } from "../buttons/AnalyzeButton";
import { getParser } from "../../parsers/parsers";
import {
  analyzeObjectivity,
  analyzePoliticalBias,
  generateSummary,
} from "../../api/chatgpt";
import { SummarySection } from "../SummarySection";
import { ArticleSection } from "../ArticleSection";
import { MessageContentType } from "../../types";

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
    if (!articleData.content) {
      console.error("No article data found");
      return;
    }

    try {
      // Execute API calls in parallel
      const [summary, politicalBias, objectivityScore] = await Promise.all([
        generateSummary(articleData.content),
        analyzePoliticalBias(articleData.content),
        analyzeObjectivity(articleData.content),
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
    } catch (error) {
      console.error("Error executing API calls:", error);
      setError("Error analyzing article");
    } finally {
      setAnalyzing(false);
    }
  };

  if (error) {
    return (
      <div className="text-red-500 flex justify-start items-center">
        {error}
      </div>
    );
  }
  if (analyzing || !summary || !politicalBias || !objectivityBias) {
    return (
      <div className="w-full h-full flex gap-4 flex-col justify-start items-center">
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
    <div className="w-full h-full flex gap-4 flex-col justify-start items-center">
      <SummarySection summaryResponse={summary} />
      <ArticleSection
        politicalBias={politicalBias}
        objectivityBias={objectivityBias}
      />
    </div>
  );
};
