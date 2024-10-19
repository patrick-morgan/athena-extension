import React from "react";
import { JournalistBiasWithNameModel } from "@/types";
import { pluralize } from "@/utils/helpers";
import { JournalistBiasCard } from "./JournalistBiasCard";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";

type JournalistSectionProps = {
  journalistsBias: JournalistBiasWithNameModel[];
  onJournalistClick: (journalistId: string) => void;
};

export const JournalistSection: React.FC<JournalistSectionProps> = ({
  journalistsBias,
  onJournalistClick,
}) => {
  if (journalistsBias.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{pluralize("Journalist", journalistsBias.length)}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {journalistsBias.map((bias) => (
          <JournalistBiasCard
            key={bias.journalist}
            name={bias.name}
            biasScore={bias.bias_score}
            rhetoricScore={bias.rhetoric_score}
            summary={bias.summary}
            numArticlesAnalyzed={bias.num_articles_analyzed}
            onJournalistClick={() => onJournalistClick(bias.journalist)}
          />
        ))}
      </CardContent>
    </Card>
  );
};
