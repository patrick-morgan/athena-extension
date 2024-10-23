import React from "react";
// import ReactMarkdown from "react-markdown";
import { Card, CardContent } from "@/components/ui/card";
// import { parseFootnotes } from "@/utils/footnotes";
// import { NumberLine } from "./NumberLine";
import { motion } from "framer-motion";
import { TooltipIcon } from "./TooltipIcon";

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
    <Card className="w-full">
      <CardContent className="p-6">
        {/* <h2 className="text-2xl font-semibold mb-4">{article.title}</h2> */}
        <div className="space-y-4">
          <BiasBar
            label="Political Bias"
            value={politicalBiasScore}
            leftLabel="Left"
            rightLabel="Right"
          />
          <WritingStyleBar
            label="Writing Style"
            value={objectivityBiasScore}
            leftLabel="Opinion"
            rightLabel="Factual"
          />
        </div>
        {/* <p className="mt-4 text-sm text-muted-foreground">{analysis.summary}</p> */}
      </CardContent>
    </Card>
  );
};

const BiasBar: React.FC<{
  label: string;
  value: number;
  leftLabel: string;
  rightLabel: string;
}> = ({ label, value, leftLabel, rightLabel }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs text-muted-foreground">
      <span>{leftLabel}</span>
      <span>{rightLabel}</span>
    </div>
    <div className="relative h-4 bg-gradient-to-r from-blue-500 via-gray-200 to-red-500 rounded-full overflow-hidden">
      <motion.div
        className="absolute top-0 bottom-0 left-0 w-1 bg-black"
        initial={{ left: 0 }}
        animate={{ left: `calc(${value * 1}% - 2px)` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
    <div className="flex justify-between text-xs">
      <div className="flex items-center">
        <span className="text-muted-foreground">{label}</span>
        <TooltipIcon content="This score is calculated based on the language and topics covered in the articles, using advanced natural language processing techniques." />
      </div>
      <span className="font-semibold">{(value * 1).toFixed(1)}%</span>
    </div>
  </div>
);

const WritingStyleBar: React.FC<{
  label: string;
  value: number;
  leftLabel: string;
  rightLabel: string;
}> = ({ label, value, leftLabel, rightLabel }) => (
  <div className="space-y-2">
    <div className="flex justify-between text-xs text-muted-foreground">
      <span>{leftLabel}</span>
      <span>{rightLabel}</span>
    </div>
    <div className="relative h-4 bg-gradient-to-r from-purple-500 via-gray-200 to-green-500 rounded-full overflow-hidden">
      <motion.div
        className="absolute top-0 bottom-0 left-0 w-1 bg-black"
        initial={{ left: 0 }}
        animate={{ left: `calc(${value * 1}% - 2px)` }}
        transition={{ duration: 1, ease: "easeOut" }}
      />
    </div>
    <div className="flex justify-between text-xs">
      <div className="flex items-center">
        <span className="text-muted-foreground">{label}</span>
        <TooltipIcon content="This score reflects the balance between opinion-based and fact-based writing, determined through analysis of language patterns, word choice, and tone of writing." />
      </div>
      <span className="font-semibold">{(value * 1).toFixed(1)}%</span>
    </div>
  </div>
);
