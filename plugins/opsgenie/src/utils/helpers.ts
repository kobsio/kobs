import { IPluginTimes, TTime, TTimeOptions, formatTime } from '@kobsio/plugin-core';
import { IOptions } from './interfaces';

// getOptionsFromSearch is used to get the Jaeger options from a given search location.
export const getOptionsFromSearch = (search: string): IOptions => {
  const params = new URLSearchParams(search);
  const query = params.get('query');
  const type = params.get('type');
  const time = params.get('time');
  const timeEnd = params.get('timeEnd');
  const timeStart = params.get('timeStart');

  return {
    query: query === null ? 'status: open' : query,
    times: {
      time: time && TTimeOptions.includes(time) ? (time as TTime) : 'last15Minutes',
      timeEnd:
        time && TTimeOptions.includes(time) && timeEnd ? parseInt(timeEnd as string) : Math.floor(Date.now() / 1000),
      timeStart:
        time && TTimeOptions.includes(time) && timeStart
          ? parseInt(timeStart as string)
          : Math.floor(Date.now() / 1000) - 900,
    },
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
