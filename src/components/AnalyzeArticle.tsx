import React from "react";
import NewspaperRoundedIcon from "@mui/icons-material/NewspaperRounded";

type AnalyzeArticleProps = {
  onClick?: () => void;
};

export const AnalyzeArticle = ({ onClick }: AnalyzeArticleProps) => {
  return (
    <div className="flex flex-col gap-2 justify-center items-center text-black">
      <span>
        <NewspaperRoundedIcon style={{ width: "64px", height: "64px" }} />
      </span>
      <h1 className="text-3xl">Analyze Article </h1>
    </div>
  );
};
