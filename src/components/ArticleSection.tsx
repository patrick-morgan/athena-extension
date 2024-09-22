import React from "react";
import { CollapsibleCard } from "./CollapsibleCard";
import {
  ObjectivityBiasResponseType,
  PoliticalBiasResponseType,
} from "@/types";
import { parseFootnotes } from "@/utils/footnotes";
import { NumberLine } from "./NumberLine";

type ArticleSectionProps = {
  politicalBias: PoliticalBiasResponseType;
  objectivityBias: ObjectivityBiasResponseType;
};

export const ArticleSection: React.FC<ArticleSectionProps> = ({
  politicalBias,
  objectivityBias,
}) => {
  const renderBulletPoints = (
    analysis: string,
    footnotes: Record<string, string>
  ) => {
    const bulletPoints = analysis
      .split("\n")
      .filter((point) => point.trim() !== "");
    return (
      <ul className="list-disc pl-5 space-y-2">
        {bulletPoints.map((point, index) => (
          <li key={index} className="text-muted-foreground text-xs">
            {parseFootnotes(point.replace(/^-\s*/, ""), footnotes)}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <CollapsibleCard
      title="Article"
      expandedContent={
        <>
          <h4 className="text-sm font-medium mb-2">Political Bias Analysis</h4>
          {renderBulletPoints(politicalBias.analysis, politicalBias.footnotes)}
          <h4 className="text-sm font-medium mt-4 mb-2">
            Objectivity Analysis
          </h4>
          {renderBulletPoints(
            objectivityBias.analysis,
            objectivityBias.footnotes
          )}
        </>
      }
    >
      <div className="flex flex-col items-center">
        <div className="w-full">
          <NumberLine
            leftText="Left wing"
            rightText="Right wing"
            tickPosition={politicalBias.bias_score}
          />
        </div>
        <div className="w-full">
          <NumberLine
            leftText="Opinion"
            rightText="Factual"
            tickPosition={objectivityBias.rhetoric_score}
          />
        </div>
      </div>
    </CollapsibleCard>
  );
};
