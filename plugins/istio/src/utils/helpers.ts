import { IPluginTimes, getTimeParams } from '@kobsio/plugin-core';
import { IOptions } from './interfaces';

// getApplicationsOptionsFromSearch is used to get the Istio options from a given search location.
export const getApplicationsOptionsFromSearch = (search: string): IOptions => {
  const params = new URLSearchParams(search);
  const namespaces = params.getAll('namespace');

  return {
    namespaces: namespaces.length > 0 ? namespaces : [],
    times: getTimeParams(params),
  };
};

// getApplicationOptionsFromSearch is used to get the Istio options from a given search location.
export const getApplicationOptionsFromSearch = (search: string): IPluginTimes => {
  const params = new URLSearchParams(search);
  return getTimeParams(params);
};

// formatNumber brings the given value returned by Prometheus as string into a format we can use in our ui.
export const formatNumber = (value: string, unit = '', dec = 4): string => {
  if (value === 'NaN') {
    return '-';
  }

  return `${Math.round(parseFloat(value) * Math.pow(10, dec)) / Math.pow(10, dec)} ${unit}`;
};
