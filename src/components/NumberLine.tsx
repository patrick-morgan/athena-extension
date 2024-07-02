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
      if (position < 50) {
        // From lighter blue to light gray
        const ratio = position / 50;
        const red = Math.floor(211 * ratio);
        const green = Math.floor(211 * ratio);
        const blue = Math.floor(230 + (211 - 230) * ratio);
        return `rgb(${red}, ${green}, ${blue})`;
      } else {
        // From light gray to red
        const ratio = (position - 50) / 50;
        const red = Math.floor(211 + (255 - 211) * ratio);
        const green = Math.floor(211 * (1 - ratio));
        const blue = Math.floor(211 * (1 - ratio));
        return `rgb(${red}, ${green}, ${blue})`;
      }
    } else if (mode === "objectivity") {
      if (position < 50) {
        // From yellow to light gray
        const ratio = position / 50;
        const red = Math.floor(255 + (211 - 255) * ratio);
        const green = Math.floor(255 + (211 - 255) * ratio);
        const blue = Math.floor(0 + (211 - 0) * ratio);
        return `rgb(${red}, ${green}, ${blue})`;
      } else {
        // From light gray to darker green
        const ratio = (position - 50) / 50;
        const red = Math.floor(211 * (1 - ratio));
        const green = Math.floor(211 + (139 - 211) * ratio);
        const blue = Math.floor(211 + (34 - 211) * ratio);
        return `rgb(${red}, ${green}, ${blue})`;
      }
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
        <span className="text-lg mx-2 text-blue-500">{leftText}</span>
        <span className="text-lg mx-2 text-red-500">{rightText}</span>
      </div>
    </div>
  );
};
