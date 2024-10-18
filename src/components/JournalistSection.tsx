import React from "react";
import ReactMarkdown from "react-markdown";
import { JournalistBiasWithNameModel } from "@/types";
import { CollapsibleCard } from "./CollapsibleCard";
import { pluralize } from "@/utils/helpers";
import { Badge } from "./ui/badge";
import { NumberLine } from "./NumberLine";

type JournalistSectionProps = {
  journalistsBias: JournalistBiasWithNameModel[];
  onJournalistClick: (journalistId: string) => void;
};

export const JournalistSection: React.FC<JournalistSectionProps> = ({
  journalistsBias,
  onJournalistClick,
}) => {
  console.log("journalist bias", journalistsBias);
  if (journalistsBias.length === 0) {
    return null;
  }

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
      title={`${pluralize("Journalist", journalistsBias.length)}`}
      tooltipText={`Scores are aggregated from all articles Athena has processed
        from each journalist`}
      expandedContent={
        <div className="space-y-4">
          {journalistsBias.map((bias, index) => (
            <div key={index} className="p-2 border border-zinc-50 rounded-md">
              <Badge variant="secondary" className="text-xs font-medium mb-1">
                {bias.name}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs text-muted-foreground space-x-1 ml-2"
              >
                {bias.num_articles_analyzed}{" "}
                {pluralize("Article", bias.num_articles_analyzed)} analyzed
              </Badge>
              {renderMarkdown(bias.summary)}
            </div>
          ))}
        </div>
      }
    >
      <div className="space-y-3">
        {journalistsBias.map((bias, index) => (
          <div key={index} className="space-y-3 space-x-1">
            <Badge
              variant="secondary"
              className="text-xs font-medium mb-1 cursor-pointer hover:bg-secondary/80"
              onClick={() => onJournalistClick(bias.journalist)}
            >
              {bias.name}
            </Badge>
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {bias.num_articles_analyzed}{" "}
              {pluralize("Article", bias.num_articles_analyzed)} analyzed
            </Badge>
            <NumberLine
              leftText="Left wing"
              rightText="Right wing"
              tickPosition={bias.bias_score}
            />
            <NumberLine
              leftText="Opinion"
              rightText="Factual"
              tickPosition={bias.rhetoric_score}
            />
          </div>
        ))}
      </div>
    </CollapsibleCard>
  );
};
