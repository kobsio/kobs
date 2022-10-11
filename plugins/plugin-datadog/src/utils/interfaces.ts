import { ITimes } from '@kobsio/shared';

export interface IOptionsLogs {
  query: string;
  times: ITimes;
}

export interface IPanelOptions {
  type: string;
  queries: IQuery[];
}

export interface IQuery {
  name?: string;
  query?: string;
}

export interface ILog {
  attributes?: ILogAttributes;
  id?: string;
  type?: string;
}

export interface ILogAttributes {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  attributes?: Record<string, any>;
  host?: string;
  message?: string;
  service?: string;
  status?: string;
  tags?: string[];
  timestamp?: string;
}
