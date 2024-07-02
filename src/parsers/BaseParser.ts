import * as cheerio from "cheerio";
import { ArticleData } from "../types";

export class BaseParser {
  protected url: string;
  protected $: cheerio.CheerioAPI;

  constructor(url: string, html: string) {
    this.url = url;
    this.$ = cheerio.load(html);
  }

  /**
   * @returns The title of the article
   */
  getTitle(): string {
    try {
      // Get the title of the article
      const $title = this.$("title");
      const titleText = $title.contents().first().text();
      console.log("title", titleText);
      return titleText;
    } catch (e) {
      console.log("Error getting title", e);
      return this.url;
    }
  }

  /**
   * @returns The author of the article
   */
  getAuthors(): string[] | undefined {
    // Default implementation, should be overridden
    return undefined;
  }

  /**
   * @returns The date the article was published
   */
  getDate(): Date | undefined {
    // Default implementation, should be overridden
    return undefined;
  }

  /**
   * Get the HTML content of the entire DOM
   * @returns The HTML content of the entire DOM
   */
  getHTML(): string {
    return this.$.html();
  }

  /**
   * Get the HTML content of the article
   * @returns The HTML content of the article
   */
  getArticleHTML(): string {
    const $articles = this.$("article");
    return $articles.html() || "";
  }

  /**
   * Removes any unwanted content from the article to prepare it for analysis
   */
  cleanContent(): void {
    // Clean body so we can process article content
    // const $body = this.$("body");

    // Remove class from body tag
    // $body.removeClass();

    // Remove scripts
    this.$("script").remove();

    // Remove meta tags
    this.$("meta").remove();

    // For now, remove links
    this.$("link").remove();

    // Remove styles
    this.$("style").remove();

    // Remove all img tags
    this.$("img").remove();

    // Remove picture tags
    this.$("picture").remove();

    // Remove source tags these seem to be garbage
    this.$("source").remove();

    // Remove img tags from em tags
    const $ems = this.$("em");
    $ems.each((i, em) => {
      const $em = this.$(em);
      $em.find("img").remove();
    });
  }

  /**
   * Postprocess the content to remove whitespace and new lines
   */
  postProcessContent(content: string | undefined): string | undefined {
    if (!content) return undefined;

    // Remove excess whitespace and newlines
    const cleaned = content.replace(/\s\s+/g, " ").trim();

    return cleaned;
  }

  /**
   * @returns The content of the article
   */
  getContent(): string | undefined {
    // Default implementation, should be overridden
    return undefined;
  }

  /**
   * Parse the article and return the data
   * @returns The parsed article data
   */
  parse(): ArticleData {
    // Get properties before we clean
    const title = this.getTitle();
    const authors = this.getAuthors();
    const date = this.getDate();

    // Clean out unwanted content and get article content
    this.cleanContent();
    const content = this.getContent();
    const cleanedContent = this.postProcessContent(content || "");

    return {
      title,
      authors,
      date,
      content: cleanedContent,
    };
  }
}
