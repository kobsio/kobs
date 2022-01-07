import { IOptions } from './interfaces';

// getInitialOptions is used to get the initial options from the url.
export const getInitialOptions = (search: string): IOptions => {
  const params = new URLSearchParams(search);
  const query = params.get('query');

  return {
    query: query ? query : '',
  };
};

export const renderCellValue = (value: string | number | string[] | number[]): string => {
  if (Array.isArray(value)) {
    return `[${value.join(', ')}]`;
  }

  return `${value}`;
};