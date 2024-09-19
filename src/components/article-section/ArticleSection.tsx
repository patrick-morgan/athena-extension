import React from "react";
import { Info, FileText } from "lucide-react";
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
    <Card className="w-full bg-card shadow-sm">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-primary flex items-center gap-2">
          Article Analysis
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-popover text-popover-foreground">
                <p>
                  A breakdown of the article's political bias and objectivity.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-secondary">Political Bias</h3>
          <NumberLine
            leftText="Left wing"
            rightText="Right wing"
            tickPosition={politicalBias.bias_score}
          />
          <p className="text-muted-foreground text-sm">
            {parseFootnotes(politicalBias.analysis, politicalBias.footnotes)}
          </p>
        </div>
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-secondary">Objectivity</h3>
          <NumberLine
            leftText="Opinion"
            rightText="Factual"
            tickPosition={objectivityBias.rhetoric_score}
          />
          <p className="text-muted-foreground text-sm">
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
