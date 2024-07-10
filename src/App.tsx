import { useState } from "react";
import "./App.css";
import { MainSection } from "./components/main/MainSection";

export const App = () => {
  const [analyzing, setAnalyzing] = useState(false);

  return (
    <div className="mx-auto h-full w-full">
      <MainSection analyzing={analyzing} setAnalyzing={setAnalyzing} />
    </div>
  );
};
