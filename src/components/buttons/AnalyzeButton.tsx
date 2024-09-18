import React from "react";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

type AnalyzeButtonProps = {
  analyzing: boolean;
  onClick: () => void;
};

export const AnalyzeButton: React.FC<AnalyzeButtonProps> = ({
  analyzing,
  onClick,
}) => {
  return (
    <Button size="lg" onClick={onClick} disabled={analyzing} className="w-48">
      {analyzing ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Analyzing...
        </>
      ) : (
        <>
          <Rocket className="mr-2 h-4 w-4" />
          Analyze
        </>
      )}
    </Button>
  );
};
