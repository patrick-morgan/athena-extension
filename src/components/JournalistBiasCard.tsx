import React from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { BiasBar, renderMarkdown, WritingStyleBar } from "./BiasAnalysisCard";
import { Button } from "./ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
import { pluralize } from "@/utils/helpers";
import { TooltipIcon } from "./TooltipIcon";

interface JournalistBiasCardProps {
  name: string;
  biasScore: number;
  rhetoricScore: number;
  summary: string;
  numArticlesAnalyzed: number;
  onJournalistClick: () => void;
}

export const JournalistBiasCard: React.FC<JournalistBiasCardProps> = ({
  name,
  biasScore,
  rhetoricScore,
  summary,
  numArticlesAnalyzed,
  onJournalistClick,
}) => {
  const [isExpanded, setIsExpanded] = React.useState(false);

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center flex-wrap max-w-[calc(100%-8rem)]">
            <h2
              className="text-xl font-semibold cursor-pointer hover:underline mr-1"
              onClick={onJournalistClick}
            >
              {name}
            </h2>
            <TooltipIcon content="This analysis is based on all articles Athena has analyzed from this journalist" />
          </div>
          <Badge variant="outline" className="text-xs shrink-0">
            {numArticlesAnalyzed} {pluralize("article", numArticlesAnalyzed)}{" "}
            analyzed
          </Badge>
        </div>
        <div className="space-y-6">
          <BiasBar
            label="Political Bias"
            value={biasScore}
            leftLabel="Left"
            rightLabel="Right"
          />
          <WritingStyleBar
            label="Writing Style"
            value={rhetoricScore}
            leftLabel="Opinion"
            rightLabel="Factual"
          />
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="w-full mt-4"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          {isExpanded ? (
            <>
              <ChevronUp className="mr-2 h-4 w-4" /> Hide Summary
            </>
          ) : (
            <>
              <ChevronDown className="mr-2 h-4 w-4" /> Show Summary
            </>
          )}
        </Button>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4"
          >
            <p className="text-sm text-muted-foreground">
              {renderMarkdown(summary)}
            </p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
