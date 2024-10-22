import React from "react";
import { PublicationAnalysisResponse } from "@/api/api";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { PublicationBiasCard } from "./PublicationBiasCard";
import { motion } from "framer-motion";

interface BlurredPublicationSectionProps {
  pubResponse: PublicationAnalysisResponse;
  onPublicationClick: () => void;
  isPremium: boolean;
}

export const BlurredPublicationSection: React.FC<
  BlurredPublicationSectionProps
> = ({ pubResponse, onPublicationClick, isPremium }) => {
  if (isPremium) {
    return (
      <PublicationSection
        pubResponse={pubResponse}
        onPublicationClick={onPublicationClick}
      />
    );
  }

  const blurredPublication: PublicationAnalysisResponse = {
    publication: {
      id: "fish",
      created_at: new Date(),
      updated_at: new Date(),
      name: pubResponse.publication.name,
      hostname: pubResponse.publication.hostname,
      date_founded: pubResponse.publication.date_founded,
      owner: pubResponse.publication.owner,
    },
    analysis: {
      id: "fish",
      created_at: new Date(),
      updated_at: new Date(),
      summary: "You're not getting the biases that easy, buddy!",
      bias_score: -500,
      rhetoric_score: -500,
      num_articles_analyzed: 50,
      publication: pubResponse.analysis.publication,
    },
  };

  return (
    <motion.div
      className="filter blur-sm select-none"
      whileHover={{ scale: 1.05 }}
    >
      <PublicationSection
        pubResponse={blurredPublication}
        onPublicationClick={() => {}}
      />
    </motion.div>
  );
};

type PublicationSectionProps = {
  pubResponse: PublicationAnalysisResponse;
  onPublicationClick: () => void;
};

const PublicationSection: React.FC<PublicationSectionProps> = ({
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
