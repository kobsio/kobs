import { formatTime, getTimeParams } from '@kobsio/plugin-core';
import { IOptions } from './interfaces';

// getInitialOptions returns the initial options from the url.
export const getInitialOptions = (search: string, isInitial: boolean): IOptions => {
  const params = new URLSearchParams(search);
  const clusters = params.getAll('cluster');
  const namespaces = params.getAll('namespace');

  return {
    clusters: clusters || [],
    namespaces: namespaces || [],
    times: getTimeParams(params, isInitial),
  };
};

export const formatTimeWrapper = (time: string): string => {
  return formatTime(Math.floor(new Date(time).getTime() / 1000));
};
