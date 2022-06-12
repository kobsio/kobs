// IPanelOptions is the interface for the options property for the TechDocs panel component.
export interface IPanelOptions {
  type?: string;
  service?: string;
}

export interface IIndex {
  key: string;
  name: string;
  description: string;
  home: string;
  toc: IPage[];
}

export interface IPage {
  [key: string]: IPage[] | string;
}

export interface IMarkdown {
  markdown: string;
  toc: string;
}
