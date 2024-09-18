import { Info } from "lucide-react";
import { parseFootnotes } from "../../utils/footnotes";
import { SummaryResponseType } from "../../types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type SummarySectionProps = {
  summaryResponse: SummaryResponseType;
};

export const SummarySection = ({ summaryResponse }: SummarySectionProps) => {
  const { summary, footnotes } = summaryResponse;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Summary
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  This section provides a concise summary of the article,
                  highlighting its main points, key arguments, and significant
                  evidence.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          {parseFootnotes(summary, footnotes)}
        </p>
      </CardContent>
    </Card>
  );
};
