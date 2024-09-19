import React from "react";
import { Info } from "lucide-react";
import { NumberLine } from "../shared/NumberLine";
import { pluralize } from "../../utils/helpers";
import { JournalistBiasWithNameModel } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

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
    <Card className="w-full bg-card shadow-sm">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-primary flex items-center gap-2">
          {pluralize("Journalist", journalistsBias.length)}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-popover text-popover-foreground">
                <p>Analysis of individual journalists' bias and objectivity.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6 pt-4">
        {journalistsBias.map((bias, index) => (
          <div key={index} className="space-y-4 p-4 rounded-md">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-sm font-medium">
                {bias.name}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs text-muted-foreground"
              >
                {bias.num_articles_analyzed}{" "}
                {pluralize("Article", bias.num_articles_analyzed)} analyzed
              </Badge>
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-secondary">
                Political Bias
              </h3>
              <NumberLine
                leftText="Left wing"
                rightText="Right wing"
                tickPosition={bias.bias_score}
              />
            </div>
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-secondary">
                Objectivity
              </h3>
              <NumberLine
                leftText="Opinion"
                rightText="Factual"
                tickPosition={bias.rhetoric_score}
              />
            </div>
            <p className="text-muted-foreground text-sm">{bias.summary}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
