// import * as cheerio from "cheerio";

// /**
//  * Parses the given HTML and extracts the main content.
//  * @param html The HTML content of the page.
//  * @returns The cleaned HTML
//  */
// export const cleanHTML = (html: string): string => {
//   const $ = cheerio.load(html);

//   // Remove unnecessary elements
//   $(
//     "script, style, noscript, picture, svg, button, source, iframe, footer, nav, aside, link, img, meta"
//   ).remove();
//   // Remove all attributes from all elements
//   $("*").each(function (idx, elem) {
//     const attributes = $(this).attr();
//     for (let attr in attributes) {
//       if (attr !== "class") $(this).removeAttr(attr);
//     }
//   });

//   // Remove new lines and whitespace
//   const cleanedHtml = $.html().replace(/\n/g, "").replace(/\s+/g, " ");
//   return cleanedHtml;
// };

import * as cheerio from "cheerio";

export const cleanHTML = (html: string): string => {
  const $ = cheerio.load(html);

  // Remove comments
  $("*")
    .contents()
    .filter(function () {
      return this.type === "comment";
    })
    .remove();

  // Remove unnecessary elements
  $(
    "script, style, noscript, picture, svg, button, source, iframe, footer, nav, aside, link, img, meta"
  ).remove();

  // Remove all attributes from all elements
  $("*").each(function () {
    const element = $(this);
    element.removeAttr("class").removeAttr("id").removeAttr("style");
    const attrs = element.attr();
    if (attrs) {
      Object.keys(attrs).forEach((attr) => {
        element.removeAttr(attr);
      });
    }
  });

  // Remove empty elements
  $("*")
    .filter(function () {
      return $(this).text().trim() === "" && $(this).children().length === 0;
    })
    .remove();

  // Simplify structure: replace divs with no attributes with their contents
  $("div").each(function () {
    if (Object.keys($(this).attr() || {}).length === 0) {
      const html = $(this).html();
      if (html) {
        $(this).replaceWith(html);
      }
    }
  });

  // Remove new lines and excess whitespace
  const cleanedHtml = $.html().replace(/\n/g, "").replace(/\s+/g, " ").trim();

  return cleanedHtml;
};
