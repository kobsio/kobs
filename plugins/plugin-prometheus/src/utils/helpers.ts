import { IMappings, IOptions } from './interfaces';
import { getTimeParams } from '@kobsio/shared';

// getInitialOptions is used to parse the given search location and return is as options for Prometheus. This is
// needed, so that a user can explore his Prometheus data from a chart. When the user selects the explore action, we
// pass him to this page and pass the data via the URL parameters.
export const getInitialOptions = (search: string, isInitial: boolean): IOptions => {
  const params = new URLSearchParams(search);
  const queries = params.getAll('query');
  const resolution = params.get('resolution');

  return {
    queries: queries.length > 0 ? queries : [''],
    resolution: resolution ? resolution : '',
    times: getTimeParams(params, isInitial),
  };
};

// getMappingValue returns the mapping for a given value.
export const getMappingValue = (value: string | number | null | undefined, mappings: IMappings): string => {
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
