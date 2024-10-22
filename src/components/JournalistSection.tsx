import React from "react";
import { pluralize } from "@/utils/helpers";
import { JournalistBiasCard } from "./JournalistBiasCard";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { JournalistBiasWithNameModel } from "@/types";
import { motion } from "framer-motion";

interface BlurredJournalistSectionProps {
  journalistsBias: JournalistBiasWithNameModel[];
  onJournalistClick: (journalistId: string) => void;
  isPremium: boolean;
}

export const BlurredJournalistSection: React.FC<
  BlurredJournalistSectionProps
> = ({ journalistsBias, onJournalistClick, isPremium }) => {
  if (isPremium) {
    return (
      <JournalistSection
        journalistsBias={journalistsBias}
        onJournalistClick={onJournalistClick}
      />
    );
  }

  return (
    <motion.div
      className="filter blur-sm select-none"
      whileHover={{ scale: 1.05 }}
    >
      <JournalistSection
        journalistsBias={journalistsBias}
        onJournalistClick={() => {}}
      />
    </motion.div>
  );
};

type JournalistSectionProps = {
  journalistsBias: JournalistBiasWithNameModel[];
  onJournalistClick: (journalistId: string) => void;
};

const JournalistSection: React.FC<JournalistSectionProps> = ({
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
