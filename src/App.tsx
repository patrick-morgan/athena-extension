import React, { useEffect, useState } from "react";
import "./App.css";
import { getParser } from "./parsers/parsers";
import {
  analyzeObjectivity,
  analyzePoliticalBias,
  generateSummary,
} from "./api/chatgpt";
import { AnalyzeArticle } from "./components/AnalyzeArticle";
import { AnalyzeButton } from "./components/buttons/AnalyzeButton";
import { MessageContentType, MessageType } from "./types";
import {
  ObjectivityBiasResponseType,
  PoliticalBiasResponseType,
  SummaryResponseType,
} from "./api/prompts";
import { MainSection } from "./components/main/MainSection";

// type Article = {
//   id: number;
//   title: string;
//   content: string;
//   summary: string;
//   biasScore: number;
//   objectivityScore: number;
// };

// const articles: Article[] = [
//   {
//     id: 1,
//     title: "Sample Article 1",
//     content: "This is the content of sample article 1.",
//     summary: "This is a summary of sample article 1.",
//     biasScore: 3,
//     objectivityScore: 7,
//   },
//   {
//     id: 2,
//     title: "Sample Article 2",
//     content: "This is the content of sample article 2.",
//     summary: "This is a summary of sample article 2.",
//     biasScore: 5,
//     objectivityScore: 6,
//   },
// ];

export const App = () => {
  const [currentUrl, setCurrentUrl] = useState<string | null>(null);
  const [websiteHTML, setWebsiteHTML] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  // const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleMessage = async (
      message: MessageType,
      sender: chrome.runtime.MessageSender,
      sendResponse: (response?: any) => void
    ) => {
      console.log("message", message);
      // Reset summary and analyzing state
      // setSummary(null);
      setAnalyzing(false);

      // URL should be defined since this event always comes from content script
      const url = sender?.tab?.url;
      if (!url) {
        console.error("No URL found in message", message);
        return;
      }
      setCurrentUrl(url);
      setWebsiteHTML(message.content.html);
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => {
      chrome.runtime.onMessage.removeListener(handleMessage);
    };
  }, []);

  // Request content from the active tab
  const requestContent = async (): Promise<MessageContentType | undefined> => {
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    console.log("ze tabs", tabs);
    const activeTab = tabs[0];
    if (activeTab?.id) {
      console.log("requesting shit from send message");
      const response = await new Promise<MessageContentType>(
        (resolve, reject) => {
          chrome.tabs.sendMessage(
            activeTab.id!,
            { action: "requestContent" },
            (response) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(response as MessageContentType);
              }
            }
          );
        }
      );
      console.log("new htlm FOO!", response);
      return response;
      // setWebsiteHTML(response.html);
    }
  };

  return (
    <div className="container mx-auto p-6 h-full w-full">
      {/** Body */}
      <MainSection
        analyzing={analyzing}
        setAnalyzing={setAnalyzing}
        requestContent={requestContent}
        currentUrl={currentUrl}
        websiteHTML={websiteHTML}
      />

      {/* {articles.map((article) => (
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
      ))} */}
    </div>
  );
};
