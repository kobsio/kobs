import { Datum, Serie } from '@nivo/line';

import { IDatum, IOptions } from './interfaces';

export const getInitialOptions = (search: string): IOptions => {
  const params = new URLSearchParams(search);
  const all = params.get('all');
  const clusterIDs = params.getAll('clusterID');
  const external = params.get('external');
  const namespaceIDs = params.getAll('namespaceID');
  const page = params.get('page');
  const perPage = params.get('perPage');
  const searchTerm = params.get('searchTerm');
  const tags = params.getAll('tag');

  return {
    all: all === 'true' ? true : false,
    clusterIDs: clusterIDs,
    external: external || 'include',
    namespaceIDs: namespaceIDs,
    page: page ? parseInt(page) : 1,
    perPage: perPage ? parseInt(perPage) : 10,
    searchTerm: searchTerm || '',
    tags: tags,
  };
};

// getMappingValue returns the mapping for a given value.
export const getMappingValue = (value: number, mappings: { [key: string]: string }): string => {
  if (!value) {
    return '';
  }

  return mappings[value.toString()];
};

// roundNumber rounds the given number to a specify number of decimals. The default number of decimals is 4 but can be
// overwritten by the user.
export const roundNumber = (value: number, dec = 4): number => {
  return Math.round(value * Math.pow(10, dec)) / Math.pow(10, dec);
};

export const sparklineDataToSeries = (data: IDatum[]): Serie[] => {
  const convertedData: Datum[] = [];

  for (const datum of data) {
    convertedData.push({ x: new Date(datum.x), y: datum.y });
  }

  return [{ data: convertedData, id: 'data' }];
};
