import React from "react";
import RocketLaunchRoundedIcon from "@mui/icons-material/RocketLaunchRounded";
import { BeatLoader } from "react-spinners";

type AnalyzeButtonProps = {
  analyzing: boolean;
  onClick: () => void;
};

export const AnalyzeButton = ({ analyzing, onClick }: AnalyzeButtonProps) => {
  return (
    <div
      className={`p-8 w-64 h-6 my-2 flex gap-2 select-none justify-center items-center bg-white border border-gray-200 rounded-sm shadow-sm ${
        analyzing
          ? "cursor-default"
          : "cursor-pointer hover:bg-slate-50 active:bg-slate-100"
      }`}
      onClick={(e) => {
        if (analyzing) return;
        onClick();
      }}
    >
      {analyzing ? (
        <>
          <span>
            <BeatLoader
              color={"#2BEE7F"}
              loading={true}
              // cssOverride={override}
              size={5}
              aria-label="Loading Spinner"
            />
          </span>
          <h4 className="text-xl text-black">Reading article...</h4>
        </>
      ) : (
        <>
          <span className="w-6 h-6 text-primaryGreen">
            <RocketLaunchRoundedIcon />
          </span>
          <h1 className="text-xl text-black">Analyze</h1>
        </>
      )}
    </div>
  );
};
