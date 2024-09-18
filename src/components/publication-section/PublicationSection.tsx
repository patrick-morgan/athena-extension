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

export const PublicationSection: React.FC<PublicationSectionProps> = ({
  pubResponse,
}) => {
  const { publication, analysis } = pubResponse;

  return (
    <Card className="w-full bg-white border border-secondary">
      <CardHeader className="border-b border-secondary">
        <CardTitle className="text-primary flex items-center gap-2">
          Publication
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-white text-text">
                <p>
                  Analysis of the publication's overall bias and objectivity
                  based on multiple articles.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary" className="bg-secondary text-white">
            {publication.name}
          </Badge>
          <Badge variant="outline" className="text-muted">
            {analysis.num_articles_analyzed}{" "}
            {pluralize("Article", analysis.num_articles_analyzed)} analyzed
          </Badge>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-primary">Political Bias</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-white text-text">
                  <p>
                    Political bias score ranges from 0 (left-wing) to 100
                    (right-wing), with 50 representing a centrist position.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <NumberLine
            leftText="Left wing"
            rightText="Right wing"
            tickPosition={analysis.bias_score}
          />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-primary">Objectivity</h3>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <Info className="h-4 w-4 text-muted" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs bg-white text-text">
                  <p>
                    Objectivity score ranges from 0 (highly opinionated) to 100
                    (very factual and objective).
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <NumberLine
            leftText="Opinion"
            rightText="Factual"
            tickPosition={analysis.rhetoric_score}
          />
        </div>
        <p className="text-sm text-muted">{analysis.summary}</p>
      </CardContent>
    </Card>
  );
};
