import React from "react";
import { Info } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { SummaryResponseType } from "@/types";
import { parseFootnotes } from "@/utils/footnotes";

type SummarySectionProps = {
  summaryResponse: SummaryResponseType;
};

export const SummarySection: React.FC<SummarySectionProps> = ({
  summaryResponse,
}) => {
  const { summary, footnotes } = summaryResponse;

  return (
    <Card className="w-full bg-card shadow-sm">
      <CardHeader className="border-b border-border">
        <CardTitle className="text-primary flex items-center gap-2">
          Summary
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="max-w-xs bg-popover text-popover-foreground">
                <p>A quick overview of the article's main points.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-foreground text-sm leading-relaxed">
          {parseFootnotes(summary, footnotes)}
        </p>
      </CardContent>
    </Card>
  );
};
