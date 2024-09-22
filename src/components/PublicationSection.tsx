import React from "react";
import { Badge } from "@/components/ui/badge";
import { pluralize } from "@/utils/helpers";
import { PublicationAnalysisResponse } from "@/api/api";
import { CollapsibleCard } from "./CollapsibleCard";
import { NumberLine } from "./NumberLine";

type PublicationSectionProps = {
  pubResponse: PublicationAnalysisResponse;
};

export const PublicationSection: React.FC<PublicationSectionProps> = ({
  pubResponse,
}) => {
  const { publication, analysis } = pubResponse;

  const renderBulletPoints = (summary: string) => {
    const bulletPoints = summary
      .split("\n")
      .filter((point) => point.trim() !== "");
    return (
      <ul className="list-disc pl-5 space-y-2">
        {bulletPoints.map((point, index) => (
          <li key={index} className="text-muted-foreground text-xs">
            {point.replace(/^-\s*/, "")}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <CollapsibleCard
      title="Publication"
      tooltipText={`Scores are aggregated from all articles Athena has processed
                  from ${publication.name}`}
      expandedContent={<>{renderBulletPoints(analysis.summary)}</>}
    >
      <div className="space-y-3 space-x-1">
        <Badge variant="secondary" className="text-xs font-medium">
          {publication.name}
        </Badge>
        <Badge variant="outline" className="text-xs text-muted-foreground">
          {analysis.num_articles_analyzed}{" "}
          {pluralize("Article", analysis.num_articles_analyzed)} analyzed
        </Badge>
        <div>
          <NumberLine
            leftText="Left wing"
            rightText="Right wing"
            tickPosition={analysis.bias_score}
          />
        </div>
        <div>
          <NumberLine
            leftText="Opinion"
            rightText="Factual"
            tickPosition={analysis.rhetoric_score}
          />
        </div>
      </div>
    </CollapsibleCard>
  );
};

// import React from "react";
// import { Badge } from "@/components/ui/badge";
// import { pluralize } from "@/utils/helpers";
// import { PublicationAnalysisResponse } from "@/api/api";
// import { CollapsibleCard } from "./CollapsibleCard";
// import { NumberLine } from "./NumberLine";

// type PublicationSectionProps = {
//   pubResponse: PublicationAnalysisResponse;
// };

// export const PublicationSection: React.FC<PublicationSectionProps> = ({
//   pubResponse,
// }) => {
//   const { publication, analysis } = pubResponse;

//   return (
//     <CollapsibleCard
//       title="Publication"
//       expandedContent={
//         <p className="text-muted-foreground text-xs">{analysis.summary}</p>
//       }
//     >
//       <div className="space-y-3 space-x-1">
//         <Badge variant="secondary" className="text-xs font-medium">
//           {publication.name}
//         </Badge>
//         <Badge variant="outline" className="text-xs text-muted-foreground">
//           {analysis.num_articles_analyzed}{" "}
//           {pluralize("Article", analysis.num_articles_analyzed)} analyzed
//         </Badge>
//         <div>
//           {/* <h3 className="text-xs font-medium text-secondary mb-1">
//             Political Bias
//           </h3> */}
//           <NumberLine
//             leftText="Left wing"
//             rightText="Right wing"
//             tickPosition={analysis.bias_score}
//           />
//         </div>
//         <div>
//           {/* <h3 className="text-xs font-medium text-secondary mb-1">
//             Objectivity
//           </h3> */}
//           <NumberLine
//             leftText="Opinion"
//             rightText="Factual"
//             tickPosition={analysis.rhetoric_score}
//           />
//         </div>
//       </div>
//     </CollapsibleCard>
//   );
// };
