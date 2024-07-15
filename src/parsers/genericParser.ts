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
    "script, style, noscript, picture, svg, button, source, iframe, footer, nav, aside, link, img, meta"
  ).remove();
  // Remove all attributes from all elements
  $("*").each(function (idx, elem) {
    const attributes = $(this).attr();
    for (let attr in attributes) {
      if (attr !== "class") $(this).removeAttr(attr);
    }
  });

  // Remove new lines and whitespace
  const cleanedHtml = $.html().replace(/\n/g, "").replace(/\s+/g, " ");
  return cleanedHtml;
};
