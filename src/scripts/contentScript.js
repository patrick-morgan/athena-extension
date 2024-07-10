// import Fuse from "fuse.js";

// This sends the article content to the background script
// const doc = document.documentElement.outerHTML;

// chrome.runtime.sendMessage({
//   action: "articleContent",
//   content: { html: doc, url: window.location.href },
// });

// const sendPageContent = () => {
//   console.log("sending page content FOO");
//   const doc = document.documentElement.outerHTML;
//   chrome.runtime.sendMessage({
//     action: "articleContent",
//     content: { html: doc, url: window.location.href },
//   });
// };

// Send the message when the content script is loaded
// sendPageContent();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "requestContent") {
    console.log("Requesting content again");
    sendResponse({
      html: document.documentElement.outerHTML,
      url: window.location.href,
    });
  } else if (message.action === "scrollToFootnote") {
    console.log("SCROLLING FOOTNOTE", message);
    const { footnoteText } = message;
    scrollToFootnote(footnoteText);
    sendResponse({ success: true });
  }
  return true; // Indicates you wish to send a response asynchronously
});

function normalizeText(text) {
  return text
    .replace(/[\n\r\s]+/g, " ")
    .replace(/["']/g, "")
    .toLowerCase()
    .trim();
}

function scrollToFootnote(footnoteText) {
  const bodyText = document.body.innerText;
  const normalizedBodyText = normalizeText(bodyText);
  const normalizedFootnoteText = normalizeText(footnoteText);

  const startIndex = normalizedBodyText.indexOf(normalizedFootnoteText);
  if (startIndex !== -1) {
    const range = document.createRange();
    const sel = window.getSelection();
    const textNodes = getTextNodesUnder(document.body);
    let charCount = 0,
      endIndex = startIndex + normalizedFootnoteText.length;
    let startNode, endNode, startOffset, endOffset;

    for (const node of textNodes) {
      const nodeLength = normalizeText(node.textContent).length;
      if (!startNode && charCount + nodeLength >= startIndex) {
        startNode = node;
        startOffset = startIndex - charCount;
      }
      if (!endNode && charCount + nodeLength >= endIndex) {
        endNode = node;
        endOffset = endIndex - charCount;
        break;
      }
      charCount += nodeLength;
    }

    console.log("start node", startNode);
    console.log("end node", endNode);

    if (startNode && endNode) {
      range.setStart(startNode, startOffset);
      range.setEnd(endNode, endOffset);
      sel.removeAllRanges();
      sel.addRange(range);
      const rect = range.getBoundingClientRect();
      window.scrollTo({
        top: rect.top + window.pageYOffset - window.innerHeight / 2,
        behavior: "smooth",
      });
      highlightText(range);
    }
  }
}

function getTextNodesUnder(el) {
  let node;
  const textNodes = [];
  const walker = document.createTreeWalker(
    el,
    NodeFilter.SHOW_TEXT,
    null,
    false
  );
  while ((node = walker.nextNode())) {
    textNodes.push(node);
  }
  return textNodes;
}

function highlightText(range) {
  console.log("highlighting range", range);
  const highlightSpan = document.createElement("span");
  highlightSpan.style.backgroundColor = "yellow";
  range.surroundContents(highlightSpan);
  // setTimeout(() => {
  //   highlightSpan.style.backgroundColor = "";
  // }, 2000);
}

// function scrollToFootnote(footnoteText) {
//   const bodyText = document.body.innerText;

//   const options = {
//     includeScore: true,
//     threshold: 0.7, // Adjust the threshold for fuzzy matching
//     keys: ["content"],
//   };

//   const fuse = new Fuse([{ content: bodyText }], options);

//   console.log("body Text", bodyText);
//   const result = fuse.search(footnoteText);
//   console.log("footnote text", footnoteText);
//   console.log("result", result);

//   if (result.length > 0) {
//     const startIndex = result[0].matches[0].indices[0][0];
//     const endIndex = result[0].matches[0].indices[0][1];
//     const range = document.createRange();
//     const sel = window.getSelection();
//     const node = document.body.childNodes[0];
//     range.setStart(node, startIndex);
//     range.setEnd(node, endIndex);
//     sel.removeAllRanges();
//     sel.addRange(range);
//     const rect = range.getBoundingClientRect();
//     window.scrollTo({
//       top: rect.top + window.pageYOffset - window.innerHeight / 2,
//       behavior: "smooth",
//     });
//     highlightText(range);
//   }
// }

// function highlightText(range) {
//   const highlightSpan = document.createElement("span");
//   highlightSpan.style.backgroundColor = "yellow";
//   range.surroundContents(highlightSpan);
//   setTimeout(() => {
//     highlightSpan.style.backgroundColor = "";
//   }, 2000);
// }
