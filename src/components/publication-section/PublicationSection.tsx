import { Info } from "lucide-react";
import { NumberLine } from "../shared/NumberLine";
import { pluralize } from "../../utils/helpers";
import { PublicationAnalysisResponse } from "../../api/api";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

type PublicationSectionProps = {
  pubResponse: PublicationAnalysisResponse;
};

export const PublicationSection = ({
  pubResponse,
}: PublicationSectionProps) => {
  const { publication, analysis } = pubResponse;

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Publication
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent>
                <p>
                  Analysis of the publication's overall bias and objectivity
                  based on multiple articles.
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{publication.name}</Badge>
          <Badge variant="outline">
            {analysis.num_articles_analyzed}{" "}
            {pluralize("Article", analysis.num_articles_analyzed)} analyzed
          </Badge>
        </div>
        <NumberLine
          leftText="Left wing"
          rightText="Right wing"
          tickPosition={analysis.bias_score}
          mode="political"
        />
        <NumberLine
          leftText="Opinion"
          rightText="Factual"
          tickPosition={analysis.rhetoric_score}
          mode="objectivity"
        />
        <p className="text-sm text-muted-foreground">{analysis.summary}</p>
      </CardContent>
    </Card>
  );
};
