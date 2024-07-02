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
  author?: string;
  date?: string;
  content?: string;
};
