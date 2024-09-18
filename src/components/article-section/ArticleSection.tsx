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
              <TooltipContent>
                <p>
                  This section provides an overview of the article's analysis,
                  including its objectivity score and political bias score.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <NumberLine
          leftText="Left wing"
          rightText="Right wing"
          tickPosition={politicalBias.bias_score}
          mode="political"
        />
        <p className="text-sm text-muted-foreground">
          {parseFootnotes(politicalBias.analysis, politicalBias.footnotes)}
        </p>
        <NumberLine
          leftText="Opinion"
          rightText="Factual"
          tickPosition={objectivityBias.rhetoric_score}
          mode="objectivity"
        />
        <p className="text-sm text-muted-foreground">
          {parseFootnotes(objectivityBias.analysis, objectivityBias.footnotes)}
        </p>
      </CardContent>
    </Card>
  );
};
