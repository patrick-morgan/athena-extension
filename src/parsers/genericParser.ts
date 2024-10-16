import * as cheerio from "cheerio";

type CleanHTMLResponse = {
  head: string;
  body: string;
  html: string;
};

export const cleanHTML = (html: string): CleanHTMLResponse => {
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

  // Remove empty elements, including empty divs
  const removeEmptyElements = () => {
    let removed;
    do {
      removed = false;
      $("*").each(function () {
        const element = $(this);
        if (element.children().length === 0 && element.text().trim() === "") {
          element.remove();
          removed = true;
        }
      });
    } while (removed);
  };

  removeEmptyElements();

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
  // console.log("cleanedHtml:");
  // console.log(cleanedHtml);

  const text = $("body").text();
  // Remove extra whitespace and trim
  const gigaCleanedText = text.replace(/\s+/g, " ").trim();

  const head = $("head").text();
  // console.log("giga cleaned body:");
  // console.log(gigaCleanedText);
  // console.log("giga cleaned head:");
  // console.log(head);

  return {
    head,
    body: gigaCleanedText,
    html: cleanedHtml,
  };
};
