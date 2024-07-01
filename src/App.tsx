import React, { useEffect, useState } from "react";
import "./App.css";
import { getParser } from "./parsers/parsers";
import { generateSummary } from "./api/chatgpt";

type Article = {
  id: number;
  title: string;
  content: string;
  summary: string;
  biasScore: number;
  objectivityScore: number;
};

const articles: Article[] = [
  {
    id: 1,
    title: "Sample Article 1",
    content: "This is the content of sample article 1.",
    summary: "This is a summary of sample article 1.",
    biasScore: 3,
    objectivityScore: 7,
  },
  {
    id: 2,
    title: "Sample Article 2",
    content: "This is the content of sample article 2.",
    summary: "This is a summary of sample article 2.",
    biasScore: 5,
    objectivityScore: 6,
  },
];

type AnalysisResult = {
  biasScore: number;
  objectivityScore: number;
};

type MessageType = {
  action: string;
  content: string;
};

export const App = () => {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(
    null
  );
  const [summary, setSummary] = useState<string>("");

  useEffect(() => {
    const handleMessage = async (
      message: MessageType,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      console.log("message", message);

      // URL should be defined since this event always comes from content script
      const url = sender?.tab?.url;
      if (!url) {
        console.error("No URL found in message", message);
        return;
      }
      const parser = getParser(url, message.content);
      const articleData = parser.parse();
      console.log("articleData", articleData);
      if (!articleData.content) {
        console.error("No article data found");
        return;
      }
      const summary = await generateSummary(articleData.content);
      console.log("the summary", summary);
      setSummary(summary.summary);
    };

    // chrome.runtime.onMessage.addListener(function (
    //   request,
    //   sender,
    //   sendResponse
    // ) {
    //   console.log(
    //     sender.tab
    //       ? "from a content script:" + sender.tab.url
    //       : "from the extension"
    //   );
    //   if (request.greeting === "hello") sendResponse({ farewell: "goodbye" });
    // });

    chrome.runtime.onMessage.addListener(handleMessage);

    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Articles</h1>
      <div id="analysisResult"></div>
      {articles.map((article) => (
        <div
          key={article.id}
          className="bg-white shadow-md rounded-lg p-6 mb-4"
        >
          <h2 className="text-xl font-bold mb-2">{article.title}</h2>
          <p className="text-gray-700 mb-2">{article.summary}</p>
          <div className="flex justify-between bg-slate-200 text-lime-600 text-xl">
            <span>Bias Score: {article.biasScore}</span>
            <span>Objectivity Score: {article.objectivityScore}</span>
          </div>
        </div>
      ))}
      {summary && (
        <div className="my-4">
          <h2 className="text-2xl font-bold mb-2">Summary</h2>
          <p>{summary}</p>
        </div>
      )}
    </div>
  );
};

// export default App;
