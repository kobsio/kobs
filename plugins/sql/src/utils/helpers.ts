// getQueryFromSearch is used to get the sql query from a given search location.
export const getQueryFromSearch = (search: string): string => {
  const params = new URLSearchParams(search);
  const query = params.get('query');
  return query ? query : '';
};

export const renderCellValue = (value: string | number | string[] | number[]): string => {
  if (Array.isArray(value)) {
    return `[${value.join(', ')}]`;
  }

  return `${value}`;
};
