import { Info } from "lucide-react";
import { NumberLine } from "../shared/NumberLine";
import { pluralize } from "../../utils/helpers";
import { PublicationAnalysisResponse } from "../../api/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type PublicationSectionProps = {
  pubResponse: PublicationAnalysisResponse;
};

export const PublicationSection = ({
  pubResponse,
}: PublicationSectionProps) => {
  const { publication, analysis } = pubResponse;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Publication
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Analysis of the publication's overall bias and objectivity
                  based on multiple articles.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{publication.name}</Badge>
          <Badge variant="outline">
            {analysis.num_articles_analyzed}{" "}
            {pluralize("Article", analysis.num_articles_analyzed)} analyzed
          </Badge>
        </div>
        <div className="flex items-center justify-between">
          <NumberLine
            leftText="Left wing"
            rightText="Right wing"
            tickPosition={analysis.bias_score}
            mode="political"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground ml-2" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Political bias ranges from purple (left-wing) through green
                  (center) to orange (right-wing). A score of 0 indicates strong
                  left bias, 50 is center, and 100 is strong right bias.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex items-center justify-between">
          <NumberLine
            leftText="Opinion"
            rightText="Factual"
            tickPosition={analysis.rhetoric_score}
            mode="objectivity"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground ml-2" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Objectivity ranges from orange (opinionated) to teal
                  (factual). A score of 0 means highly opinionated, while 100
                  means very factual and objective.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <p className="text-sm text-muted-foreground">{analysis.summary}</p>
      </CardContent>
    </Card>
  );
};
