import { IOptions } from './interfaces';
import { getTimeParams } from '@kobsio/shared';

// getInitialOptions returns the initial options for the applications page from the url.
export const getInitialOptions = (search: string, isInitial: boolean): IOptions => {
  const params = new URLSearchParams(search);
  const scope = params.get('scope');

  return {
    scope: scope ? scope : 'All',
    times: getTimeParams(params, isInitial, 'last30Days'),
  };
};
