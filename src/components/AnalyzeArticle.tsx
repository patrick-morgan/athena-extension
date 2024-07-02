import React from "react";
import DescriptionOutlinedIcon from "@mui/icons-material/DescriptionOutlined";

type AnalyzeArticleProps = {
  onClick?: () => void;
};

export const AnalyzeArticle = ({ onClick }: AnalyzeArticleProps) => {
  return (
    <div className="flex mt-4 flex-col gap-2 justify-center items-center text-black">
      <span>
        <DescriptionOutlinedIcon style={{ width: "64px", height: "64px" }} />
      </span>
      <h1 className="text-3xl">Analyze Article </h1>
    </div>
  );
};
