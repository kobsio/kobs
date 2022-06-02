import { IOptions } from './interfaces';

// getInitialOptions is used to get the initial options from the url.
export const getInitialOptions = (search: string): IOptions => {
  const params = new URLSearchParams(search);
  const query = params.get('query');
  const page = params.get('page');
  const perPage = params.get('perPage');

  return {
    page: page ? parseInt(page) : 1,
    perPage: perPage ? parseInt(perPage) : 1,
    query: query === null ? '' : query,
  };
};
