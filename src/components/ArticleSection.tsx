import React from "react";
// import ReactMarkdown from "react-markdown";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { parseFootnotes } from "@/utils/footnotes";
import { NumberLine } from "./NumberLine";

type ArticleSectionProps = {
  politicalBiasScore: number;
  objectivityBiasScore: number;
};

export const ArticleSection: React.FC<ArticleSectionProps> = ({
  politicalBiasScore,
  objectivityBiasScore,
}) => {
  // const handleFootnoteClick = (footnoteId: string, footnoteText: string) => {
  //   // Implement your footnote click handling logic here
  //   console.log(`Footnote ${footnoteId}: ${footnoteText}`);
  // };

  // const renderContent = (
  //   content: string,
  //   footnotes: Record<string, string>
  // ) => {
  //   const parsedContent = parseFootnotes(content, footnotes);
  //   return parsedContent.map((part: string | JSX.Element, index: number) => {
  //     if (typeof part === "string") {
  //       return (
  //         <ReactMarkdown
  //           key={index}
  //           components={{
  //             p: ({ node, ...props }) => (
  //               <span className="text-muted-foreground text-xs" {...props} />
  //             ),
  //             li: ({ node, ...props }) => (
  //               <li className="text-muted-foreground text-xs" {...props} />
  //             ),
  //             ul: ({ node, ...props }) => (
  //               <ul className="list-disc pl-5 space-y-2" {...props} />
  //             ),
  //           }}
  //         >
  //           {part}
  //         </ReactMarkdown>
  //       );
  //     } else {
  //       // This is a footnote
  //       return <></>;
  //       // const footnoteId = part.props.children[1];
  //       // return (
  //       //   <button
  //       //     key={index}
  //       //     className="ml-1 text-blue-400 cursor-pointer bg-transparent border-none p-0 font-normal text-xs"
  //       //     onClick={() =>
  //       //       handleFootnoteClick(footnoteId, footnotes[footnoteId])
  //       //     }
  //       //   >
  //       //     [{footnoteId}]
  //       //   </button>
  //       // );
  //     }
  //   });
  // };

  return (
    <Card className="w-full bg-card shadow-sm">
      <CardHeader>
        <CardTitle className="text-primary text-md">Article Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <NumberLine
              leftText="Left wing"
              rightText="Right wing"
              tickPosition={politicalBiasScore}
            />
            {/* <div className="space-y-2">
              {renderContent(politicalBias.analysis, politicalBias.footnotes)}
            </div> */}
          </div>
          <div>
            <NumberLine
              leftText="Opinion"
              rightText="Factual"
              tickPosition={objectivityBiasScore}
            />
            {/* <div className="space-y-2">
              {renderContent(objectivityBias.analysis, objectivityBias.footnotes)}
            </div> */}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
