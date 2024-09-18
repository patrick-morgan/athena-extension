import React from "react";

interface NumberLineProps {
  leftText: string;
  rightText: string;
  tickPosition: number;
}

export const NumberLine: React.FC<NumberLineProps> = ({
  leftText,
  rightText,
  tickPosition,
}) => {
  return (
    <div className="w-full my-5 max-w-[350px]">
      <div className="flex items-center">
        <div className="relative flex-grow bg-secondary h-2 rounded-full">
          <div
            className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 rounded-full bg-accent"
            style={{
              left: `${tickPosition}%`,
            }}
          ></div>
        </div>
      </div>
      <div className="flex justify-between mt-2">
        <span className="text-sm font-medium text-primary">{leftText}</span>
        <span className="text-sm font-medium text-primary">{rightText}</span>
      </div>
    </div>
  );
};
