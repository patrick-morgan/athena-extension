import React from "react";
import "./NumberLine.css";

interface NumberLineProps {
  leftText: string;
  rightText: string;
  tickPosition: number; // Value between 0 and 100 representing the percentage position of the tick
  mode: "political" | "objectivity"; // Mode to determine the color scheme
}
export const NumberLine: React.FC<NumberLineProps> = ({
  leftText,
  rightText,
  tickPosition,
  mode,
}) => {
  const calculateTickColor = (position: number) => {
    if (mode === "political") {
      // Gradient from purple (left) to green (center) to orange (right)
      if (position < 50) {
        // Purple to green
        const ratio = position / 50;
        return `rgb(${144 + 11 * ratio}, ${19 + 215 * ratio}, ${
          254 - 166 * ratio
        })`;
      } else {
        // Green to orange
        const ratio = (position - 50) / 50;
        return `rgb(${155 + 100 * ratio}, ${234 - 92 * ratio}, ${
          88 + 0 * ratio
        })`;
      }
    } else if (mode === "objectivity") {
      // Gradient from orange (opinion) to teal (factual)
      return `rgb(${255 - 0 * (position / 100)}, ${
        142 + 56 * (position / 100)
      }, ${88 + 141 * (position / 100)})`;
    }
  };

  return (
    <div className="w-full my-5 max-w-[350px]">
      <div className="flex items-center">
        <div className="number-line relative flex-grow">
          <div
            className="tick"
            style={{
              left: `${tickPosition}%`,
              transform: "translateX(-50%)",
              backgroundColor: calculateTickColor(tickPosition),
            }}
          ></div>
        </div>
      </div>
      <div className="flex justify-between mt-2">
        <span
          className="text-sm font-medium"
          style={{ color: mode === "political" ? "#9013FE" : "#FF8E58" }}
        >
          {leftText}
        </span>
        <span
          className="text-sm font-medium"
          style={{ color: mode === "political" ? "#FF9B58" : "#00E5E5" }}
        >
          {rightText}
        </span>
      </div>
    </div>
  );
};
