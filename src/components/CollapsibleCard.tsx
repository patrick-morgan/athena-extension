import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Info } from "lucide-react";

interface CollapsibleCardProps {
  title: string;
  tooltipText?: string;
  children: React.ReactNode;
  expandedContent: React.ReactNode;
}

export const CollapsibleCard: React.FC<CollapsibleCardProps> = ({
  title,
  tooltipText,
  children,
  expandedContent,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <Card className="w-full bg-card shadow-sm relative pb-6">
        <CardHeader className="border-b border-border py-2 flex items-center flex-row justify-start space-x-2">
          <CardTitle className="text-primary text-md">{title}</CardTitle>
          {tooltipText && (
            <span>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs">
                    <p>{tooltipText}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </span>
          )}
        </CardHeader>
        <CardContent className="pt-2 pb-0">
          {children}
          <CollapsibleContent className="mt-2 space-y-2">
            {expandedContent}
          </CollapsibleContent>
        </CardContent>
        <div className="absolute bottom-1 left-0 right-0 flex justify-center">
          <CollapsibleTrigger asChild>
            <div className="p-1 hover:bg-muted rounded-full transition-colors duration-200 cursor-pointer">
              {isOpen ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
          </CollapsibleTrigger>
        </div>
      </Card>
    </Collapsible>
  );
};
