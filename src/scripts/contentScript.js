// // contentScript.js

// function extractArticleContent() {
//   // Example extraction logic for CNN and Fox News
//   let articleContent = "";

//   console.log("running extractor");

//   if (window.location.hostname.includes("cnn.com")) {
//     const article = document.querySelector("article");
//     console.log("the article", article);
//     if (article) {
//       articleContent = article.innerText;
//     }
//   } else if (window.location.hostname.includes("foxnews.com")) {
//     const article = document.querySelector(".article-body");
//     if (article) {
//       articleContent = article.innerText;
//     }
//   }

//   return articleContent.trim();
// }

// const articleContent = extractArticleContent();
// if (articleContent) {
//   chrome.runtime.sendMessage({
//     action: "analyzeArticle",
//     content: articleContent,
//   });
// }

// //   (async () => {
// //     const response = await chrome.runtime.sendMessage({greeting: "hello"});
// //     // do something with response here, not outside the function
// //     console.log(response);
// //   })();

const doc = document.documentElement.outerHTML;
console.log("the doc", doc);

// const article = document.querySelector("article");

console.log("RUNNING CONTENT SCRIPT");

chrome.runtime.sendMessage({
  action: "articleContent",
  content: doc,
});

// `document.querySelector` may return null if the selector doesn't match anything.
// if (article) {
//   console.log("ARTICLE FOUND", article);
//   const text = article.textContent;
//   console.log("TEXT", text);
//   const wordMatchRegExp = /[^\s]+/g; // Regular expression
//   const words = text.matchAll(wordMatchRegExp);
//   // matchAll returns an iterator, convert to array to get word count
//   const wordCount = [...words].length;
//   const readingTime = Math.round(wordCount / 200);
//   const badge = document.createElement("p");
//   // Use the same styling as the publish information in an article's header
//   badge.classList.add("color-secondary-text", "type--caption");
//   badge.textContent = `⏱️ ${readingTime} min read fish`;

//   chrome.runtime.sendMessage({
//     action: "analyzeArticle",
//     content: "",
//   });

//   // Support for API reference docs
//   const heading = article.querySelector("h1");
//   // Support for article docs with date
//   const date = article.querySelector("time")?.parentNode;

//   (date ?? heading).insertAdjacentElement("afterend", badge);
// }

// // document.documentElement.innerText
