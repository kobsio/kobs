import { IOptions, TType } from './interfaces';
import { getTimeParams } from '@kobsio/plugin-core';

// getInitialOptions returns the initial options from the url.
export const getInitialOptions = (search: string, isInitial: boolean): IOptions => {
  const params = new URLSearchParams(search);
  const type = params.get('type');
  const cluster = params.get('cluster');

  let parsedType: TType = 'sources';
  if (type && type !== '') {
    parsedType = type as TType;
  }

  return {
    cluster: cluster || '',
    times: getTimeParams(params, isInitial),
    type: parsedType,
  };
};
