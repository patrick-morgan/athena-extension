export const parseFootnotes = (
  text: string,
  footnotes: Record<string, string>
) => {
  const regex = /\[\^(\d+)\]/g;
  return text.split(regex).map((part, index) => {
    if (index % 2 === 0) {
      return part;
    }
    return (
      <a
        key={index}
        href="#"
        className="ml-1 text-blue-500 cursor-pointer"
        onClick={(e) => handleFootnoteClick(e, part, footnotes)}
      >
        [{part}]
      </a>
    );
  });
};

export const handleFootnoteClick = async (
  e: React.MouseEvent,
  footnoteId: string,
  footnotes: Record<string, string>
) => {
  e.preventDefault();
  const footnoteText = footnotes[`^${footnoteId}`];
  if (footnoteText) {
    const tabs = await chrome.tabs.query({
      active: true,
      currentWindow: true,
    });
    const activeTab = tabs[0];
    if (activeTab?.id) {
      const response = await new Promise<{ success: boolean }>(
        (resolve, reject) => {
          chrome.tabs.sendMessage(
            activeTab.id!,
            { action: "scrollToFootnote", footnoteText },
            (response) => {
              if (chrome.runtime.lastError) {
                reject(chrome.runtime.lastError);
              } else {
                resolve(response as { success: boolean });
              }
            }
          );
        }
      );
    }
  }
};
