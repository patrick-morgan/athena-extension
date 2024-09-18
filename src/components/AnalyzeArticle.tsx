import React from "react";
import { FileText } from "lucide-react";

export const AnalyzeArticle: React.FC = () => {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <FileText className="h-24 w-24 text-primary" />
      <h1 className="text-3xl font-bold">Analyze Article</h1>
      <p className="text-muted-foreground">
        Click the button below to start analyzing the current article
      </p>
    </div>
  );
};
