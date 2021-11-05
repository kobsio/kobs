import { IOptions } from './interfaces';

// getOptionsFromSearch is used to get the Jaeger options from a given search location.
export const getOptionsFromSearch = (search: string): IOptions => {
  const params = new URLSearchParams(search);
  const query = params.get('query');

  return {
    query: query === null ? '' : query,
  };
};
