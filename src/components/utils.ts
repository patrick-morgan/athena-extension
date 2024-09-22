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
              reject(chrome.runtime.lastError);
            } else {
              resolve(response as MessageContentType);
            }
          }
        );
      }
    );
    console.log("HTML FOO!", response);
    return response;
  }
};
