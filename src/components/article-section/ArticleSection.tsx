import React from "react";
import { NumberLine } from "../shared/NumberLine";
import { parseFootnotes } from "../../utils/footnotes";
import {
  ObjectivityBiasResponseType,
  PoliticalBiasResponseType,
} from "../../types";
import { CollapsibleCard } from "../CollapsibleCard";

type ArticleSectionProps = {
  politicalBias: PoliticalBiasResponseType;
  objectivityBias: ObjectivityBiasResponseType;
};

export const ArticleSection: React.FC<ArticleSectionProps> = ({
  politicalBias,
  objectivityBias,
}) => {
  return (
    <CollapsibleCard
      title="Article"
      expandedContent={
        <>
          <p className="text-muted-foreground text-xs">
            {parseFootnotes(politicalBias.analysis, politicalBias.footnotes)}
          </p>
          <p className="text-muted-foreground text-xs mt-2">
            {parseFootnotes(
              objectivityBias.analysis,
              objectivityBias.footnotes
            )}
          </p>
        </>
      }
    >
      <div className="space-y-2 flex flex-col items-center">
        <div className="w-full">
          {/* <h3 className="text-xs font-medium text-secondary">Political Bias</h3> */}
          <NumberLine
            leftText="Left wing"
            rightText="Right wing"
            tickPosition={politicalBias.bias_score}
          />
        </div>
        <div className="w-full">
          {/* <h3 className="text-xs font-medium text-secondary">Objectivity</h3> */}
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
