import { IOptions } from './interfaces';
import { formatTime } from '@kobsio/shared';

// getInitialOptions is used to get the initial options from the url.
export const getInitialOptions = (search: string): IOptions => {
  const params = new URLSearchParams(search);
  const query = params.get('query');

  return {
    query: query ? query : '',
  };
};

export const renderCellValue = (value: string | number | string[] | number[], unit?: string): string => {
  if (Array.isArray(value)) {
    return `[${value.join(', ')}] ${unit}`;
  }

  if (unit) {
    if (unit === 'time') {
      return formatTime(Math.floor(new Date(value).getTime() / 1000));
    } else {
      return `${value} ${unit}`;
    }
  }

  return `${value}`;
};
