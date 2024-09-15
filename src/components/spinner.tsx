import React from "react";
import { ClipLoader } from "react-spinners";

export const Spinner: React.FC = () => {
  return (
    <div className="flex flex-col justify-center items-center h-full">
      <ClipLoader color="#3B82F6" size={50} speedMultiplier={0.75} />
      <p className="mt-4 text-gray-600">Loading Athena...</p>
    </div>
  );
};
