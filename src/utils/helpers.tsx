export const getHostname = (url: string) => {
  return new URL(url).hostname;
};

export const pluralize = (word: string, count: number) => {
  return count === 1 ? word : `${word}s`;
};
