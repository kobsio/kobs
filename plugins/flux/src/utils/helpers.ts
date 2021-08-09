import { IOptions, TType } from './interfaces';

// getOptionsFromSearch returns the options for a given search location.
export const getOptionsFromSearch = (search: string): IOptions => {
  const params = new URLSearchParams(search);
  const type = params.get('type');
  const cluster = params.get('cluster');

  let parsedType: TType = 'sources';
  if (type && type !== '') {
    parsedType = type as TType;
  }

  return {
    cluster: cluster || '',
    type: parsedType,
  };
};
