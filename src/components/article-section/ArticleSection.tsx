import { Info } from "lucide-react";
import { NumberLine } from "../shared/NumberLine";
import { parseFootnotes } from "../../utils/footnotes";
import {
  ObjectivityBiasResponseType,
  PoliticalBiasResponseType,
} from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type ArticleSectionProps = {
  politicalBias: PoliticalBiasResponseType;
  objectivityBias: ObjectivityBiasResponseType;
};

export const ArticleSection = ({
  politicalBias,
  objectivityBias,
}: ArticleSectionProps) => {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Article Analysis
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <p>
                  This section provides an overview of the article's political
                  bias and objectivity.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <NumberLine
            leftText="Left wing"
            rightText="Right wing"
            tickPosition={politicalBias.bias_score}
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
        <p className="text-sm text-muted-foreground">
          {parseFootnotes(politicalBias.analysis, politicalBias.footnotes)}
        </p>
        <div className="flex items-center justify-between">
          <NumberLine
            leftText="Opinion"
            rightText="Factual"
            tickPosition={objectivityBias.rhetoric_score}
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
        <p className="text-sm text-muted-foreground">
          {parseFootnotes(objectivityBias.analysis, objectivityBias.footnotes)}
        </p>
      </CardContent>
    </Card>
  );
};
