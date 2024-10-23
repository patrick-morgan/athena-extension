// import React from "react";
// import { Info } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import {
//   Tooltip,
//   TooltipContent,
//   TooltipTrigger,
// } from "@/components/ui/tooltip";
// import { SummaryResponseType } from "@/types";
// import { parseFootnotes } from "@/utils/footnotes";

// type SummarySectionProps = {
//   summary: string;
// };

// export const SummarySection: React.FC<SummarySectionProps> = ({ summary }) => {
//   // const { summary, footnotes } = summaryResponse;

//   console.log("sunmmary", summary);

//   // console.log("footnotes", footnotes);

//   // Split the summary into bullet points
//   const bulletPoints = summary
//     .split("\n")
//     .filter((point) => point.trim() !== "");

//   return (
//     <Card className="w-full bg-card shadow-sm">
//       <CardHeader className="border-b border-border">
//         <CardTitle className="text-primary flex items-center gap-2">
//           Summary
//           {/* <Tooltip>
//             <TooltipTrigger>
//               <Info className="h-4 w-4 text-muted-foreground" />
//             </TooltipTrigger>
//             <TooltipContent className="max-w-xs bg-popover text-popover-foreground">
//               <p>A quick overview of the article's main points.</p>
//             </TooltipContent>
//           </Tooltip> */}
//         </CardTitle>
//       </CardHeader>
//       <CardContent className="pt-4">
//         <ul className="list-disc pl-5 space-y-2">
//           {bulletPoints.map((point, index) => (
//             <li key={index} className="text-foreground text-sm leading-relaxed">
//               {parseFootnotes(point.replace(/^-\s*/, ""), {})}
//             </li>
//           ))}
//         </ul>
//       </CardContent>
//     </Card>
//   );
// };

// // {point.replace(/^-\s*/, "")}

import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { motion } from "framer-motion";
import { renderMarkdown } from "./BiasAnalysisCard";

interface BlurredSummarySectionProps {
  summary: string | null;
  isPremium: boolean;
}

export const BlurredSummarySection: React.FC<BlurredSummarySectionProps> = ({
  summary,
  isPremium,
}) => {
  if (!summary) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Article Summary & Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        {isPremium ? (
          <p>{renderMarkdown(summary)}</p>
        ) : (
          <motion.div
            className="filter blur-sm select-none"
            whileHover={{ scale: 1.05 }}
          >
            <p>{renderMarkdown(summary)}</p>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
};
