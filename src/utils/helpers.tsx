import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const getHostname = (url: string) => {
  return new URL(url).hostname;
};

export const pluralize = (word: string, count: number) => {
  return count === 1 ? word : `${word}s`;
};

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
