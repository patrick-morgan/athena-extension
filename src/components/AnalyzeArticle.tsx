import React from "react";
import { FileText } from "lucide-react";

export const AnalyzeArticle: React.FC = () => {
  return (
    <div className="text-center">
      <FileText className="h-24 w-24 text-primary mx-auto mb-4" />
      <h1 className="text-3xl font-bold mb-2">Analyze Article</h1>
      <p className="text-muted-foreground">
        Click the button below to start analyzing the current article
      </p>
    </div>
  );
};
