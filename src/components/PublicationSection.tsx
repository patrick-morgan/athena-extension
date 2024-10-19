import React from "react";
import { PublicationAnalysisResponse } from "@/api/api";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { PublicationBiasCard } from "./PublicationBiasCard";

type PublicationSectionProps = {
  pubResponse: PublicationAnalysisResponse;
  onPublicationClick: () => void;
};

export const PublicationSection: React.FC<PublicationSectionProps> = ({
  pubResponse,
  onPublicationClick,
}) => {
  const { publication, analysis } = pubResponse;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Publication</CardTitle>
      </CardHeader>
      <CardContent>
        <PublicationBiasCard
          name={publication.name}
          hostname={publication.hostname}
          biasScore={analysis.bias_score}
          rhetoricScore={analysis.rhetoric_score}
          summary={analysis.summary}
          numArticlesAnalyzed={analysis.num_articles_analyzed}
          onPublicationClick={onPublicationClick}
        />
      </CardContent>
    </Card>
  );
};
