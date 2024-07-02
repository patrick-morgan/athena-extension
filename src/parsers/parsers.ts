import { BaseParser } from "./BaseParser";
import { CNNParser } from "./CNNParser";
import { FoxParser } from "./FoxParser";

type ParserMapType = Record<string, typeof BaseParser>;

// Mapping of hostname to parser
const parsers: ParserMapType = {
  "www.foxnews.com": FoxParser,
  "www.cnn.com": CNNParser,
  // 'siteB.com': parseSiteB
};

/**
 * Get the parser object for the given URL
 * @param url
 * @param html
 * @returns An instantiated parser object for the given URL
 */
export const getParser = (url: string, html: string): BaseParser => {
  const hostname = new URL(url).hostname;
  const ParserClass = parsers[hostname] || BaseParser;
  return new ParserClass(url, html);
};
