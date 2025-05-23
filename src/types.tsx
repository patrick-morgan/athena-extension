import { PublicationAnalysisResponse } from "./api/api";

export type AppStateType = {
  currentUrl: string;
  article: ArticleModel | null;
  publication: PublicationModel | null;
  journalists: ArticleAuthorType[] | null;
  // summary: SummaryModel | null;
  summary: string | null;
  politicalBiasScore: number | null;
  objectivityBiasScore: number | null;
  // politicalBias: PoliticalBiasResponseType | null;
  // objectivityBias: ObjectivityBiasResponseType | null;
  journalistsAnalysis: JournalistBiasWithNameModel[] | null;
  publicationAnalysis: PublicationAnalysisResponse | null;
  error: string | null;
};

export type MessageType = {
  action: string;
  content: MessageContentType;
};

// The website data we are sent from chrome extension message to here
export type MessageContentType = {
  html: string;
  url: string;
};

// DB Models
export type ArticleModel = {
  id: string;
  created_at: Date;
  updated_at: Date;
  url: string;
  title: string;
  subtitle: string | null;
  date_published: Date;
  date_updated: Date | null;
  text: string;
  publication: PublicationModel;
  // publicationObject: PublicationModel;
  article_authors: ArticleAuthorType[];
};

export type ArticleAuthorType = {
  article_id: string;
  journalist_id: string;
  journalist: JournalistsModel;
};

export type PublicationModel = {
  id: string;
  created_at: Date;
  updated_at: Date;
  name: string;
  date_founded: Date;
  hostname: string;
  owner: string;
};

export type JournalistsModel = {
  id: string;
  created_at: Date;
  updated_at: Date;
  name: string;
  publication: string; // publication_id
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

export type PublicationBiasModel = {
  id: string;
  created_at: Date;
  updated_at: Date;
  summary: string;
  publication: string; // publication_id
  bias_score: number;
  rhetoric_score: number;
  num_articles_analyzed: number;
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
