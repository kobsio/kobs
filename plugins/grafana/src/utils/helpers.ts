import { IOptions } from './interfaces';

// getInitialOptions is used to get the initial options from the url.
export const getInitialOptions = (): IOptions => {
  const params = new URLSearchParams(window.location.search);
  const query = params.get('query');

  return {
    query: query === null ? '' : query,
  };
};
