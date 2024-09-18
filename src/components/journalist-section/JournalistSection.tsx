import { Info } from "lucide-react";
import { JournalistBiasWithNameModel } from "../../types";
import { NumberLine } from "../shared/NumberLine";
import { pluralize } from "../../utils/helpers";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type JournalistSectionProps = {
  journalistsBias: JournalistBiasWithNameModel[];
};

export const JournalistSection: React.FC<JournalistSectionProps> = ({
  journalistsBias,
}) => {
  if (journalistsBias.length === 0) {
    return null;
  }

  return (
    <Card className="w-full bg-white border border-secondary">
      <CardHeader className="border-b border-secondary">
        <CardTitle className="text-primary flex items-center gap-2">
          {pluralize("Journalist", journalistsBias.length)}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-white text-text">
                <p>
                  Analysis of individual journalists' bias and objectivity based
                  on their articles.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {journalistsBias.map((bias, index) => (
          <div key={index} className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-secondary text-white">
                {bias.name}
              </Badge>
              <Badge variant="outline" className="text-muted">
                {bias.num_articles_analyzed}{" "}
                {pluralize("Article", bias.num_articles_analyzed)} analyzed
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-primary">
                  Political Bias
                </h3>
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
                tickPosition={bias.bias_score}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-primary">
                  Objectivity
                </h3>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <Info className="h-4 w-4 text-muted" />
                    </TooltipTrigger>
                    <TooltipContent className="max-w-xs bg-white text-text">
                      <p>
                        Objectivity score ranges from 0 (highly opinionated) to
                        100 (very factual and objective).
                      </p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
              <NumberLine
                leftText="Opinion"
                rightText="Factual"
                tickPosition={bias.rhetoric_score}
              />
            </div>
            <p className="text-sm text-muted">{bias.summary}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
