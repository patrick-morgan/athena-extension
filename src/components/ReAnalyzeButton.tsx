import React from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";

interface ReAnalyzeButtonProps {
  onClick: () => void;
  analyzing: boolean;
}

export const ReAnalyzeButton: React.FC<ReAnalyzeButtonProps> = ({
  onClick,
  analyzing,
}) => {
  return (
    <Button onClick={onClick} disabled={analyzing} className="w-full mt-4">
      {analyzing ? (
        <>
          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
          Updating...
        </>
      ) : (
        <>
          <RefreshCw className="mr-2 h-4 w-4" />
          Re-analyze Article
        </>
      )}
    </Button>
  );
};
