import { IOptions } from './interfaces';

// getInitialOptions is used to get the initial options from the url.
export const getInitialOptions = (search: string): IOptions => {
  const params = new URLSearchParams(search);
  const query = params.get('query');

  return {
    query: query === null ? '' : query,
  };
};
