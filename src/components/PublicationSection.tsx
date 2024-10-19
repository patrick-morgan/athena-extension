import React from "react";
import ReactMarkdown from "react-markdown";
import { Badge } from "@/components/ui/badge";
import { pluralize } from "@/utils/helpers";
import { PublicationAnalysisResponse } from "@/api/api";
import { CollapsibleCard } from "./CollapsibleCard";
import { NumberLine } from "./NumberLine";

type PublicationSectionProps = {
  pubResponse: PublicationAnalysisResponse;
  onPublicationClick: () => void;
};

export const PublicationSection: React.FC<PublicationSectionProps> = ({
  pubResponse,
  onPublicationClick,
}) => {
  const { publication, analysis } = pubResponse;

  const renderMarkdown = (content: string) => {
    return (
      <ReactMarkdown
        components={{
          p: ({ node, ...props }) => (
            <p className="text-muted-foreground text-xs" {...props} />
          ),
          li: ({ node, ...props }) => (
            <li className="text-muted-foreground text-xs" {...props} />
          ),
          ul: ({ node, ...props }) => (
            <ul className="list-disc pl-5 space-y-2" {...props} />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    );
  };

  return (
    <CollapsibleCard
      title="Publication"
      tooltipText={`Scores are aggregated from all articles Athena has processed
                  from ${publication.name ?? publication.hostname}`}
      expandedContent={renderMarkdown(analysis.summary)}
    >
      <div className="space-y-3 space-x-1">
        <Badge
          variant="secondary"
          className="text-xs font-medium cursor-pointer hover:bg-secondary/80"
          onClick={onPublicationClick}
        >
          {publication.name ?? publication.hostname}
        </Badge>
        <Badge variant="outline" className="text-xs text-muted-foreground">
          {analysis.num_articles_analyzed}{" "}
          {pluralize("Article", analysis.num_articles_analyzed)} analyzed
        </Badge>
        <div>
          <NumberLine
            leftText="Left wing"
            rightText="Right wing"
            tickPosition={analysis.bias_score}
          />
        </div>
        <div>
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
