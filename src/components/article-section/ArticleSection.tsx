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

export const ArticleSection: React.FC<ArticleSectionProps> = ({
  politicalBias,
  objectivityBias,
}) => {
  return (
    <Card className="w-full bg-white border border-secondary">
      <CardHeader className="border-b border-secondary">
        <CardTitle className="text-primary flex items-center gap-2">
          Article Analysis
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-white text-text">
                <p>
                  This section provides an overview of the article's political
                  bias and objectivity.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
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
            tickPosition={politicalBias.bias_score}
          />
          <p className="text-sm text-muted">
            {parseFootnotes(politicalBias.analysis, politicalBias.footnotes)}
          </p>
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
            tickPosition={objectivityBias.rhetoric_score}
          />
          <p className="text-sm text-muted">
            {parseFootnotes(
              objectivityBias.analysis,
              objectivityBias.footnotes
            )}
          </p>
        </div>
      </CardContent>
    </Card>
  );
};
