import { JournalistBiasWithNameModel } from "@/types";
import { CollapsibleCard } from "./CollapsibleCard";
import { pluralize } from "@/utils/helpers";
import { Badge } from "./ui/badge";
import { NumberLine } from "./NumberLine";

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
    <CollapsibleCard
      title={`${pluralize("Journalist", journalistsBias.length)}`}
      expandedContent={
        <div className="space-y-2">
          {journalistsBias.map((bias, index) => (
            <div key={index} className="p-2 bg-muted rounded-md">
              <Badge variant="secondary" className="text-xs font-medium mb-1">
                {bias.name}
              </Badge>
              <Badge
                variant="outline"
                className="text-xs text-muted-foreground space-x-1"
              >
                {bias.num_articles_analyzed}{" "}
                {pluralize("Article", bias.num_articles_analyzed)} analyzed
              </Badge>
              <p className="text-muted-foreground text-xs mt-1">
                {bias.summary}
              </p>
            </div>
          ))}
        </div>
      }
    >
      <div className="space-y-3">
        {journalistsBias.map((bias, index) => (
          <div key={index} className="space-y-3 space-x-1">
            <Badge variant="secondary" className="text-xs font-medium">
              {bias.name}
            </Badge>
            <Badge variant="outline" className="text-xs text-muted-foreground">
              {bias.num_articles_analyzed}{" "}
              {pluralize("Article", bias.num_articles_analyzed)} analyzed
            </Badge>
            <NumberLine
              leftText="Left wing"
              rightText="Right wing"
              tickPosition={bias.bias_score}
            />
            <NumberLine
              leftText="Opinion"
              rightText="Factual"
              tickPosition={bias.rhetoric_score}
            />
          </div>
        ))}
      </div>
    </CollapsibleCard>
  );
};
