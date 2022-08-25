import { IAgentsOptions, IRequestsOptions } from './interfaces';
import { getTimeParams } from '@kobsio/shared';

export const getInitialRequestsOptions = (search: string, isInitial: boolean): IRequestsOptions => {
  const params = new URLSearchParams(search);
  const page = params.get('page');
  const perPage = params.get('perPage');
  const query = params.get('query');
  const siteName = params.get('siteName');

  return {
    page: page ? parseInt(page) : 1,
    perPage: perPage ? parseInt(perPage) : 1000,
    query: query || '',
    siteName: siteName || '',
    times: getTimeParams(params, isInitial),
  };
};

export const getInitialAgentsOptions = (search: string, isInitial: boolean): IAgentsOptions => {
  const params = new URLSearchParams(search);
  const siteName = params.get('siteName');

  return {
    siteName: siteName || '',
    times: getTimeParams(params, isInitial),
  };
};

export const getFlag = (countryCode: string): string => {
  const codePoints = countryCode
    .toUpperCase()
    .split('')
    .map((char) => 127397 + char.charCodeAt(0));
  return String.fromCodePoint(...codePoints);
};

export const roundNumber = (value: number, dec = 2): number => {
  return Math.round(value * Math.pow(10, dec)) / Math.pow(10, dec);
};
