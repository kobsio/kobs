import { IOptionsLogs } from './interfaces';
import { getTimeParams } from '@kobsio/shared';

export const getInitialOptionsLogs = (search: string, isInitial: boolean): IOptionsLogs => {
  const params = new URLSearchParams(search);
  const query = params.get('query');

  return {
    query: query ? query : '',
    times: getTimeParams(params, isInitial),
  };
};

// formatTime formate the given time string. We do not use the formatTime function from the core package, because we
// also want to include milliseconds in the logs timestamp, which we show.
export const formatTime = (time?: string): string => {
  if (!time) {
    return '';
  }

  const d = new Date(time);
  return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)} ${(
    '0' + d.getHours()
  ).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}:${('0' + d.getSeconds()).slice(-2)}.${(
    '00' + d.getMilliseconds()
  ).slice(-3)}`;
};
