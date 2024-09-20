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

function scrollToFootnote(footnoteText) {
  const paragraphs = document.querySelectorAll("p, div, span");
  let bestMatch = { element: null, score: 0, index: -1 };

  paragraphs.forEach((element, index) => {
    const score = fuzzyMatch(element.textContent, footnoteText);
    if (score > bestMatch.score) {
      bestMatch = { element, score, index };
    }
  });

  if (bestMatch.element) {
    console.log("Best match element:", bestMatch.element);
    bestMatch.element.scrollIntoView({ behavior: "smooth", block: "center" });
    highlightElement(bestMatch.element, footnoteText);
  }
}

function fuzzyMatch(text, pattern) {
  const normText = normalizeText(text);
  const normPattern = normalizeText(pattern);
  let score = 0;
  let lastIndex = 0;

  for (let i = 0; i < normPattern.length; i++) {
    const index = normText.indexOf(normPattern[i], lastIndex);
    if (index > -1) {
      score += 1;
      lastIndex = index + 1;
    }
  }

  return score / normPattern.length;
}

function normalizeText(text) {
  return text.toLowerCase().replace(/[^\w\s]/g, "");
}

function highlightElement(element, searchText) {
  const originalHTML = element.innerHTML;
  const normalizedSearchText = normalizeText(searchText);
  const regex = new RegExp(`(${escapeRegExp(normalizedSearchText)})`, "gi");

  element.innerHTML = originalHTML.replace(
    regex,
    (match) => `<span class="highlight">${match}</span>`
  );

  const highlightSpans = element.querySelectorAll(".highlight");
  highlightSpans.forEach((span) => {
    span.style.backgroundColor = "yellow";
    span.style.transition = "background-color 2s";
  });

  setTimeout(() => {
    highlightSpans.forEach((span) => {
      span.style.backgroundColor = "transparent";
    });
  }, 2000);

  setTimeout(() => {
    element.innerHTML = originalHTML;
  }, 4000);
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
