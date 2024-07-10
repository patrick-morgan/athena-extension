export type MessageType = {
  action: string;
  content: MessageContentType;
};

// The website data we are sent from chrome extension message to here
export type MessageContentType = {
  html: string;
  url: string;
};

export type ArticleData = {
  title?: string;
  authors?: string[];
  date?: Date;
  content?: string;
};

type Article = {
  id: string;
  title: string;
  subtitle: string;
  date: Date;
  text: string;
  authors: string[]; // Foreign keys to Journalist
  publication: string; // Foreign key to Publication
  summary: string; // Foreign key to Summary
  polarizationBias: string; // Foreign key to PolarizationBias
  objectivityBias: string; // Foreign key to ObjectivityBias
};

type Summary = {
  id: string;
  article_id: string; // Foreign key to Article
  summary: string;
  footnotes: { [key: string]: string };
};

type PolarizationBias = {
  id: string;
  article_id: string; // Foreign key to Article
  analysis: string;
  bias_score: number;
  footnotes: { [key: string]: string };
};

type ObjectivityBias = {
  id: string;
  article_id: string; // Foreign key to Article
  rhetoric_score: number;
  analysis: string;
  footnotes: { [key: string]: string };
};

type Journalist = {
  id: string;
  name: string;
  publications: string[]; // Foreign keys to Publication
};

type Publication = {
  id: string;
  name: string;
  date_founded: Date;
  url: string;
  owner: string;
};

// This should ALWAYS match the output example in the summary prompt (found in be)
export type SummaryResponseType = {
  summary: string;
  footnotes: { [key: string]: string };
};

// This should ALWAYS match the output example in the objectivity prompt (found in be)
export type ObjectivityBiasResponseType = {
  rhetoric_score: number;
  analysis: string;
  footnotes: { [key: string]: string };
};

// This should ALWAYS match the output example in the political bias prompt (found in be)
export type PoliticalBiasResponseType = {
  bias_score: number;
  analysis: string;
  footnotes: { [key: string]: string };
};
