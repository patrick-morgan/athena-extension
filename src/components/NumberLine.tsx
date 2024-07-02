import React from "react";
import "./NumberLine.css";

interface NumberLineProps {
  leftText: string;
  rightText: string;
  tickPosition: number; // Value between 0 and 100 representing the percentage position of the tick
}

export const NumberLine: React.FC<NumberLineProps> = ({
  leftText,
  rightText,
  tickPosition,
}) => {
  return (
    <div className="flex items-center w-full my-5">
      <span className="text-lg text-blue-500 mx-2">{leftText}</span>
      <div className="number-line relative flex-grow">
        <div
          className="tick bg-blue-500"
          style={{ left: `${tickPosition}%`, transform: "translateX(-50%)" }}
        ></div>
      </div>
      <span className="text-lg text-red-500 mx-2">{rightText}</span>
    </div>
  );
};
