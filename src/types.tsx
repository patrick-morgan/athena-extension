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
  title: string;
  date: Date;
  authors: string[];
  text: string;
  url: string;
  hostname: string;
  subtitle?: string;
};

// DB Models
export type ArticleModel = {
  id: string;
  created_at: Date;
  updated_at: Date;
  url: string;
  title: string;
  subtitle: string | null;
  date: Date;
  text: string;
  publication: string;
};

export type SummaryModel = {
  id: string;
  created_at: Date;
  updated_at: Date;
  article_id: string;
  summary: string;
  footnotes: { [key: string]: string };
};

export type JournalistBiasModel = {
  id: string;
  created_at: Date;
  updated_at: Date;
  summary: string;
  bias_score: number;
  rhetoric_score: number;
  num_articles_analyzed: number;
  journalist: string; // journalist_id
};

export type JournalistBiasWithNameModel = {
  id: string;
  name: string;
  created_at: Date;
  updated_at: Date;
  summary: string;
  bias_score: number;
  rhetoric_score: number;
  num_articles_analyzed: number;
  journalist: string; // journalist_id
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
