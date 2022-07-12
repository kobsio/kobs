import { IOptions } from './interfaces';
import { getTimeParams } from '@kobsio/shared';

// getInitialOptions is used to get the initial RSS options from a the url.
export const getInitialOptions = (search: string, isInitial: boolean): IOptions => {
  const params = new URLSearchParams(search);
  const url = params.get('url');

  return {
    times: getTimeParams(params, isInitial),
    url: url === null ? '' : url,
  };
};
