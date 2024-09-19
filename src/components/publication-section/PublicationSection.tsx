import React from "react";
import { Info } from "lucide-react";
import { NumberLine } from "../shared/NumberLine";
import { pluralize } from "../../utils/helpers";
import { PublicationAnalysisResponse } from "../../api/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

type PublicationSectionProps = {
  pubResponse: PublicationAnalysisResponse;
};

export const PublicationSection: React.FC<PublicationSectionProps> = ({
  pubResponse,
}) => {
  const { publication, analysis } = pubResponse;

  return (
    <Card className="w-full bg-card shadow-sm">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-primary flex items-center gap-2">
          Publication
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-popover text-popover-foreground">
                <p>
                  Analysis of the publication's overall bias and objectivity.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="text-sm font-medium">
            {publication.name}
          </Badge>
          <Badge variant="outline" className="text-xs text-muted-foreground">
            {analysis.num_articles_analyzed}{" "}
            {pluralize("Article", analysis.num_articles_analyzed)} analyzed
          </Badge>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-secondary">Political Bias</h3>
          <NumberLine
            leftText="Left wing"
            rightText="Right wing"
            tickPosition={analysis.bias_score}
          />
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-secondary">Objectivity</h3>
          <NumberLine
            leftText="Opinion"
            rightText="Factual"
            tickPosition={analysis.rhetoric_score}
          />
        </div>
        <p className="text-muted-foreground text-sm">{analysis.summary}</p>
      </CardContent>
    </Card>
  );
};
