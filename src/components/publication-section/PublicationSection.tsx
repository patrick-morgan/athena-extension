import React from "react";
import { NumberLine } from "../shared/NumberLine";
import { PublicationAnalysisResponse } from "../../api/api";
import { Badge } from "@/components/ui/badge";
import { CollapsibleCard } from "../CollapsibleCard";
import { pluralize } from "@/utils/helpers";

type PublicationSectionProps = {
  pubResponse: PublicationAnalysisResponse;
};

export const PublicationSection: React.FC<PublicationSectionProps> = ({
  pubResponse,
}) => {
  const { publication, analysis } = pubResponse;

  return (
    <CollapsibleCard
      title="Publication"
      expandedContent={
        <p className="text-muted-foreground text-xs">{analysis.summary}</p>
      }
    >
      <div className="space-y-3 space-x-1">
        <Badge variant="secondary" className="text-xs font-medium">
          {publication.name}
        </Badge>
        <Badge variant="outline" className="text-xs text-muted-foreground">
          {analysis.num_articles_analyzed}{" "}
          {pluralize("Article", analysis.num_articles_analyzed)} analyzed
        </Badge>
        <div>
          {/* <h3 className="text-xs font-medium text-secondary mb-1">
            Political Bias
          </h3> */}
          <NumberLine
            leftText="Left wing"
            rightText="Right wing"
            tickPosition={analysis.bias_score}
          />
        </div>
        <div>
          {/* <h3 className="text-xs font-medium text-secondary mb-1">
            Objectivity
          </h3> */}
          <NumberLine
            leftText="Opinion"
            rightText="Factual"
            tickPosition={analysis.rhetoric_score}
          />
        </div>
      </div>
    </CollapsibleCard>
  );
};
