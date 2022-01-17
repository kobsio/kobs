import { IOptions } from './interfaces';
import { formatTime } from '@kobsio/plugin-core';

// getInitialOptions is used to get the initial options from the url.
export const getInitialOptions = (search: string): IOptions => {
  const params = new URLSearchParams(search);
  const query = params.get('query');

  return {
    query: query ? query : '',
  };
};

export const renderCellValue = (value: string | number | string[] | number[], format?: string): string => {
  let formattedValue = `${value}`;

  if (Array.isArray(value)) {
    formattedValue = `[${value.join(', ')}]`;
  }

  if (format) {
    if (format === 'time') {
      formatTime(Math.floor(new Date(formattedValue).getTime() / 1000));
    } else {
      formattedValue = format.replaceAll(`{% .value %}`, formattedValue);
    }
  }

  return formattedValue;
};
