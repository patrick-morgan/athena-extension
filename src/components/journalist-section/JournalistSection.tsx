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

export const JournalistSection = ({
  journalistsBias,
}: JournalistSectionProps) => {
  if (journalistsBias.length === 0) {
    return null;
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {pluralize("Journalist", journalistsBias.length)}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  Analysis of individual journalists' bias and objectivity based
                  on their articles.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {journalistsBias.map((bias, index) => (
          <div key={index} className="space-y-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{bias.name}</Badge>
              <Badge variant="outline">
                {bias.num_articles_analyzed}{" "}
                {pluralize("Article", bias.num_articles_analyzed)} analyzed
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <NumberLine
                leftText="Left wing"
                rightText="Right wing"
                tickPosition={bias.bias_score}
                mode="political"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground ml-2" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>
                      Political bias ranges from purple (left-wing) through
                      green (center) to orange (right-wing). A score of 0
                      indicates strong left bias, 50 is center, and 100 is
                      strong right bias.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center justify-between">
              <NumberLine
                leftText="Opinion"
                rightText="Factual"
                tickPosition={bias.rhetoric_score}
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
                      (factual). A score of 0 means highly opinionated, while
                      100 means very factual and objective.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <p className="text-sm text-muted-foreground">{bias.summary}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
