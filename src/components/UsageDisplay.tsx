import React from "react";
import { Progress } from "./ui/progress";
import { Info } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";
import { initiateSubscription } from "@/api/stripe";
import { Button } from "./ui/button";
import { UserUsageResponse } from "@/api/api";
import { User } from "firebase/auth";
import { Skeleton } from "./ui/skeleton";

type UsageDisplayProps = {
  usage: UserUsageResponse | null;
  user: User | null;
};

export const UsageDisplay = ({ usage, user }: UsageDisplayProps) => {
  const isLoading = usage === null;
  const remainingArticles = Math.max(0, usage?.articlesRemaining ?? 0);
  const totalAllowed = usage?.totalAllowed ?? 5;

  const handleSubscribe = async () => {
    if (user) {
      try {
        const checkoutUrl = await initiateSubscription();
        window.open(checkoutUrl, "_blank");
        // logEvent("subscription_initiated", { userId: user.uid });
      } catch (error) {
        console.error("Error initiating subscription:", error);
        // logEvent("subscription_error", {
        //   error: (error as Error).message,
        // });
      }
    }
  };

  return (
    <div className="space-y-2 p-4 bg-secondary/10 rounded-lg">
      <div className="flex justify-between items-center text-sm">
        <div className="flex items-center gap-2">
          <span>Articles Remaining</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Info className="h-4 w-4 text-muted-foreground" />
              </TooltipTrigger>
              <TooltipContent className="bg-popover text-popover-foreground p-4 max-w-[200px] border shadow-md">
                <div className="space-y-2">
                  <p className="text-sm">
                    Free users get {totalAllowed} free articles each month.
                    Upgrade for unlimited articles.
                  </p>
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={handleSubscribe}
                  >
                    Upgrade to Premium
                  </Button>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {isLoading ? (
          <Skeleton className="h-4 w-16" />
        ) : (
          <span className="font-medium">
            {remainingArticles === -1 ? "0" : remainingArticles} of{" "}
            {totalAllowed}
          </span>
        )}
      </div>
      {isLoading ? (
        <div className="w-full h-4 bg-secondary animate-pulse rounded-full" />
      ) : (
        <Progress
          value={
            ((remainingArticles === -1 ? 0 : remainingArticles) /
              totalAllowed) *
            100
          }
        />
      )}
      {!isLoading && remainingArticles <= 0 && (
        <div className="flex flex-col space-y-3 mt-3">
          <p className="text-sm text-muted-foreground">
            You are out of free articles this month.
          </p>
          <Button
            variant="default"
            size="sm"
            className="w-full flex items-center justify-center gap-2 font-medium"
            onClick={handleSubscribe}
          >
            Upgrade to Premium
            <span className="opacity-70">→</span>
          </Button>
        </div>
      )}
    </div>
  );
};
