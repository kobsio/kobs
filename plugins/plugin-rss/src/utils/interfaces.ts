import { ITimes } from '@kobsio/shared';

export interface IOptions {
  url: string;
  times: ITimes;
}

export interface IPanelOptions {
  urls?: string[];
  sortBy?: string;
}

export interface IItem {
  feedTitle?: string;
  feedImage?: string;
  feedLink?: string;
  title?: string;
  description?: string;
  content?: string;
  link?: string;
  links?: string[];
  updated?: number;
  published?: number;
  image?: string;
  categories?: string[];
  custom?: { [key: string]: string };
}
