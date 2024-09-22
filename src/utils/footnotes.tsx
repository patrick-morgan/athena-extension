// import React from "react";

// export const parseFootnotes = (
//   text: string,
//   footnotes: Record<string, string>
// ) => {
//   const regex = /\[\^(\d+)\]/g;
//   return text.split(regex).map((part, index) => {
//     if (index % 2 === 0) {
//       return part;
//     }
//     return (
//       <button
//         key={index}
//         className="ml-1 text-blue-400 cursor-pointer bg-transparent border-none p-0 font-normal text-sm"
//         onClick={() => handleFootnoteClick(part, footnotes[part])}
//       >
//         [{part}]
//       </button>
//     );
//   });
// };

// const handleFootnoteClick = async (
//   footnoteId: string,
//   footnoteText: string
// ) => {
//   const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
//   const activeTab = tabs[0];
//   if (activeTab?.id) {
//     try {
//       await chrome.tabs.sendMessage(activeTab.id, {
//         action: "scrollToFootnote",
//         footnoteText,
//       });
//     } catch (error) {
//       console.error("Error scrolling to footnote:", error);
//     }
//   }
// };

import React from "react";

export const parseFootnotes = (
  text: string,
  footnotes: Record<string, string>
): (string | JSX.Element)[] => {
  const regex = /\[\^(\d+)\]/g;
  const parts = text.split(regex);

  return parts.map((part, index) => {
    if (index % 2 === 0) {
      return part;
    }
    const footnoteId = part;
    return <></>;
    // return (
    //   <button
    //     key={index}
    //     className="ml-1 text-blue-400 cursor-pointer bg-transparent border-none p-0 font-normal text-sm"
    //     onClick={() => handleFootnoteClick(footnoteId, footnotes[footnoteId])}
    //   >
    //     [{footnoteId}]
    //   </button>
    // );
  });
};

const handleFootnoteClick = async (
  footnoteId: string,
  footnoteText: string
) => {
  console.log("scrolling to footnote", footnoteId, footnoteText);
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];
  if (activeTab?.id) {
    try {
      await chrome.tabs.sendMessage(activeTab.id, {
        action: "scrollToFootnote",
        footnoteText,
      });
    } catch (error) {
      console.error("Error scrolling to footnote:", error);
    }
  }
};
