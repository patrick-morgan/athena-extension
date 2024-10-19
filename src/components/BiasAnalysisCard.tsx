import React, { ReactNode } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "./ui/card";
import ReactMarkdown from "react-markdown";

export const BiasAnalysisCard: React.FC<{
  biasScore: number;
  rhetoricScore: number;
  summary: string;
  children?: ReactNode;
}> = ({ biasScore, rhetoricScore, summary, children }) => (
  <Card>
    <CardContent className="p-6">
      {children}
      <h2 className="text-xl font-semibold mb-4">Bias Analysis</h2>
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
      <p className="mt-6 text-sm text-muted-foreground">
        {renderMarkdown(summary)}
      </p>
    </CardContent>
  </Card>
);

export const BiasBar: React.FC<{
  label: string;
  value: number;
  leftLabel: string;
  rightLabel: string;
}> = ({ label, value, leftLabel, rightLabel }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs text-muted-foreground">
      <span>{leftLabel}</span>
      <span>{rightLabel}</span>
    </div>
    <div className="relative h-4 bg-gradient-to-r from-blue-500 via-gray-200 to-red-500 rounded-full overflow-hidden">
      <motion.div
        className="absolute top-0 bottom-0 left-0 w-1 bg-black"
        initial={{ left: 0 }}
        animate={{ left: `calc(${value * 1}% - 2px)` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{(value * 1).toFixed(1)}%</span>
    </div>
  </div>
);

export const WritingStyleBar: React.FC<{
  label: string;
  value: number;
  leftLabel: string;
  rightLabel: string;
}> = ({ label, value, leftLabel, rightLabel }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs text-muted-foreground">
      <span>{leftLabel}</span>
      <span>{rightLabel}</span>
    </div>
    <div className="relative h-4 bg-gradient-to-r from-purple-500 via-gray-200 to-green-500 rounded-full overflow-hidden">
      <motion.div
        className="absolute top-0 bottom-0 left-0 w-1 bg-black"
        initial={{ left: 0 }}
        animate={{ left: `calc(${value * 1}% - 2px)` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
    <div className="flex justify-between text-xs">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{(value * 1).toFixed(1)}%</span>
    </div>
  </div>
);

export const renderMarkdown = (content: string) => {
  return (
    <ReactMarkdown
      components={{
        p: ({ node, ...props }) => (
          <p className="text-muted-foreground text-xs" {...props} />
        ),
        li: ({ node, ...props }) => (
          <li className="text-muted-foreground text-xs" {...props} />
        ),
        ul: ({ node, ...props }) => (
          <ul className="list-disc pl-5 space-y-2" {...props} />
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
};
