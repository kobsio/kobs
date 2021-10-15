import { IPluginTimes, formatTime, getTimeParams } from '@kobsio/plugin-core';
import { IOptions } from './interfaces';

// getOptionsFromSearch is used to get the Jaeger options from a given search location.
export const getOptionsFromSearch = (search: string): IOptions => {
  const params = new URLSearchParams(search);
  const query = params.get('query');
  const type = params.get('type');

  return {
    query: query === null ? 'status: open' : query,
    times: getTimeParams(params),
    type: type ? type : 'alerts',
  };
};

export const formatTimeWrapper = (time: string): string => {
  return formatTime(Math.floor(new Date(time).getTime() / 1000));
};

export const queryWithTime = (query: string, times: IPluginTimes): string => {
  return query
    ? `${query} AND createdAt >= ${times.timeStart} AND createdAt <= ${times.timeEnd}`
    : `createdAt >= ${times.timeStart} AND createdAt <= ${times.timeEnd}`;
};
