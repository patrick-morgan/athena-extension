import * as cheerio from "cheerio";

/**
 * Parses the given HTML and extracts the main content.
 * @param html The HTML content of the page.
 * @returns The cleaned HTML
 */
export const cleanHTML = (html: string): string => {
  const $ = cheerio.load(html);

  // Remove unnecessary elements
  $(
    "script, style, noscript, iframe, header, footer, nav, aside, link, img"
  ).remove();
  // Remove all attributes from all elements
  $("*").each(function (idx, elem) {
    const attributes = $(this).attr();
    for (let attr in attributes) {
      if (attr !== "class") $(this).removeAttr(attr);
    }
  });

  // Remove svgs
  $("svg").remove();
  // Remove buttons
  $("button").remove();

  console.log("html after cleaning:");
  console.log($.html());

  // const textContent = $("body").text();
  // Clean up the text content by removing extra spaces and newlines
  // const cleanedText = textContent.replace(/\s+/g, " ").trim();

  // return cleanedText;
  return $.html();
};
