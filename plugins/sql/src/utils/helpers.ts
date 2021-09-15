// getQueryFromSearch is used to get the sql query from a given search location.
export const getQueryFromSearch = (search: string): string => {
  const params = new URLSearchParams(search);
  const query = params.get('query');
  return query ? query : '';
};
