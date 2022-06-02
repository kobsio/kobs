import { ITimes, formatTime, getTimeParams } from '@kobsio/shared';
import { IOptions } from './interfaces';

// getInitialOptions is used to get the initial Opsgenie options from a the url.
export const getInitialOptions = (search: string, isInitial: boolean): IOptions => {
  const params = new URLSearchParams(search);
  const query = params.get('query');
  const type = params.get('type');

  return {
    query: query === null ? 'status: open' : query,
    times: getTimeParams(params, isInitial),
    type: type ? type : 'alerts',
  };
};

export const formatTimeWrapper = (time: string): string => {
  return formatTime(Math.floor(new Date(time).getTime() / 1000));
};

export const queryWithTime = (query: string, times: ITimes, interval?: number): string => {
  if (interval) {
    const timeEnd = Math.floor(Date.now() / 1000);
    const timeStart = Math.floor(Date.now() / 1000) - interval;

    return query
      ? `${query} AND createdAt >= ${timeStart} AND createdAt <= ${timeEnd}`
      : `createdAt >= ${timeStart} AND createdAt <= ${timeEnd}`;
  }

  return query
    ? `${query} AND createdAt >= ${times.timeStart} AND createdAt <= ${times.timeEnd}`
    : `createdAt >= ${times.timeStart} AND createdAt <= ${times.timeEnd}`;
};
