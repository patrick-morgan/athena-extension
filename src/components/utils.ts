import { MessageContentType } from "@/types";

// Request content from the active tab
export const requestContent = async (): Promise<
  MessageContentType | undefined
> => {
  const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
  const activeTab = tabs[0];
  if (activeTab?.id) {
    const response = await new Promise<MessageContentType>(
      (resolve, reject) => {
        chrome.tabs.sendMessage(
          activeTab.id!,
          { action: "requestContent" },
          (response) => {
            if (chrome.runtime.lastError) {
              console.error("Chrome runtime error:", chrome.runtime.lastError);
              reject();
            } else if (response) {
              resolve(response as MessageContentType);
            } else {
              console.error("No response received");
              reject();
            }
          }
        );
      }
    );
    console.log("HTML FOO!", response);
    return response;
  }
};

// export const requestContent = (): Promise<{
//   html: string;
//   url: string;
// } | null> => {
//   return new Promise((resolve) => {
//     chrome.runtime.sendMessage({ action: "requestContent" }, (response) => {
//       if (chrome.runtime.lastError) {
//         console.error("Chrome runtime error:", chrome.runtime.lastError);
//         resolve(null);
//       } else if (response) {
//         resolve(response);
//       } else {
//         console.error("No response received");
//         resolve(null);
//       }
//     });
//   });
// };

export const scrollToTop = () => {
  const mainContent = document.querySelector("main");
  if (mainContent) {
    mainContent.scrollTop = 0;
  }
};
