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
              <TooltipContent>
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
            <NumberLine
              leftText="Left wing"
              rightText="Right wing"
              tickPosition={bias.bias_score}
              mode="political"
            />
            <NumberLine
              leftText="Opinion"
              rightText="Factual"
              tickPosition={bias.rhetoric_score}
              mode="objectivity"
            />
            <p className="text-sm text-muted-foreground">{bias.summary}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};
