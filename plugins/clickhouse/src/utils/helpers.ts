import { TTime, TTimeOptions, formatTime } from '@kobsio/plugin-core';
import { IOptions } from './interfaces';

// getOptionsFromSearch is used to get the ClickHouse options from a given search location.
export const getOptionsFromSearch = (search: string): IOptions => {
  const params = new URLSearchParams(search);
  const fields = params.getAll('field');
  const maxDocuments = params.get('maxDocuments');
  const order = params.get('order');
  const orderBy = params.get('orderBy');
  const query = params.get('query');
  const time = params.get('time');
  const timeEnd = params.get('timeEnd');
  const timeStart = params.get('timeStart');

  return {
    fields: fields.length > 0 ? fields : undefined,
    maxDocuments: maxDocuments ? maxDocuments : '',
    order: order ? order : 'ascending',
    orderBy: orderBy ? orderBy : '',
    query: query ? query : '',
    times: {
      time: time && TTimeOptions.includes(time) ? (time as TTime) : 'last15Minutes',
      timeEnd:
        time && TTimeOptions.includes(time) && timeEnd ? parseInt(timeEnd as string) : Math.floor(Date.now() / 1000),
      timeStart:
        time && TTimeOptions.includes(time) && timeStart
          ? parseInt(timeStart as string)
          : Math.floor(Date.now() / 1000) - 900,
    },
  };
};

// getQueryFromSearch is used to get the sql query from a given search location.
export const getQueryFromSearch = (search: string): string => {
  const params = new URLSearchParams(search);
  const query = params.get('query');
  return query ? query : '';
};

// formatTimeWrapper is a wrapper for our shared formatTime function. It is needed to convert a given time string to the
// corresponding timestamp representation, which we need for the formatTime function.
export const formatTimeWrapper = (time: string): string => {
  return formatTime(Math.floor(new Date(time).getTime() / 1000));
};
