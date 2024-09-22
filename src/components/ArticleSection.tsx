import React from "react";
import ReactMarkdown from "react-markdown";
import { CollapsibleCard } from "./CollapsibleCard";
import {
  ObjectivityBiasResponseType,
  PoliticalBiasResponseType,
} from "@/types";
import { parseFootnotes } from "@/utils/footnotes";
import { NumberLine } from "./NumberLine";

type ArticleSectionProps = {
  politicalBias: PoliticalBiasResponseType;
  objectivityBias: ObjectivityBiasResponseType;
};

export const ArticleSection: React.FC<ArticleSectionProps> = ({
  politicalBias,
  objectivityBias,
}) => {
  // const handleFootnoteClick = (footnoteId: string, footnoteText: string) => {
  //   // Implement your footnote click handling logic here
  //   console.log(`Footnote ${footnoteId}: ${footnoteText}`);
  // };

  const renderContent = (
    content: string,
    footnotes: Record<string, string>
  ) => {
    const parsedContent = parseFootnotes(content, footnotes);
    return parsedContent.map((part: string | JSX.Element, index: number) => {
      if (typeof part === "string") {
        return (
          <ReactMarkdown
            key={index}
            components={{
              p: ({ node, ...props }) => (
                <span className="text-muted-foreground text-xs" {...props} />
              ),
              li: ({ node, ...props }) => (
                <li className="text-muted-foreground text-xs" {...props} />
              ),
              ul: ({ node, ...props }) => (
                <ul className="list-disc pl-5 space-y-2" {...props} />
              ),
            }}
          >
            {part}
          </ReactMarkdown>
        );
      } else {
        // This is a footnote
        return <></>;
        // const footnoteId = part.props.children[1];
        // return (
        //   <button
        //     key={index}
        //     className="ml-1 text-blue-400 cursor-pointer bg-transparent border-none p-0 font-normal text-xs"
        //     onClick={() =>
        //       handleFootnoteClick(footnoteId, footnotes[footnoteId])
        //     }
        //   >
        //     [{footnoteId}]
        //   </button>
        // );
      }
    });
  };

  return (
    <CollapsibleCard
      title="Article"
      expandedContent={
        <>
          <h4 className="text-sm font-medium mb-2">Political Bias Analysis</h4>
          <div className="space-y-2">
            {renderContent(politicalBias.analysis, politicalBias.footnotes)}
          </div>
          <h4 className="text-sm font-medium mt-4 mb-2">
            Objectivity Analysis
          </h4>
          <div className="space-y-2">
            {renderContent(objectivityBias.analysis, objectivityBias.footnotes)}
          </div>
        </>
      }
    >
      <div className="flex flex-col items-center">
        <div className="w-full">
          <NumberLine
            leftText="Left wing"
            rightText="Right wing"
            tickPosition={politicalBias.bias_score}
          />
        </div>
        <div className="w-full">
          <NumberLine
            leftText="Opinion"
            rightText="Factual"
            tickPosition={objectivityBias.rhetoric_score}
          />
        </div>
      </div>
    </CollapsibleCard>
  );
};
