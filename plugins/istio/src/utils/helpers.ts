import { IPluginTimes, TTime, TTimeOptions } from '@kobsio/plugin-core';
import { IOptions } from './interfaces';

// getApplicationsOptionsFromSearch is used to get the Istio options from a given search location.
export const getApplicationsOptionsFromSearch = (search: string): IOptions => {
  const params = new URLSearchParams(search);
  const namespaces = params.getAll('namespace');
  const time = params.get('time');
  const timeEnd = params.get('timeEnd');
  const timeStart = params.get('timeStart');

  return {
    namespaces: namespaces.length > 0 ? namespaces : [],
    times: {
      time: time && TTimeOptions.includes(time) ? (time as TTime) : 'last15Minutes',
      timeEnd:
        time && TTimeOptions.includes(time) && timeEnd ? parseInt(timeEnd as string) : Math.floor(Date.now() / 1000),
      timeStart:
        time && TTimeOptions.includes(time) && timeStart
          ? parseInt(timeStart as string)
          : Math.floor(Date.now() / 1000) - 900,
    },
  };
};

// getApplicationOptionsFromSearch is used to get the Istio options from a given search location.
export const getApplicationOptionsFromSearch = (search: string): IPluginTimes => {
  const params = new URLSearchParams(search);
  const time = params.get('time');
  const timeEnd = params.get('timeEnd');
  const timeStart = params.get('timeStart');

  return {
    time: time && TTimeOptions.includes(time) ? (time as TTime) : 'last15Minutes',
    timeEnd:
      time && TTimeOptions.includes(time) && timeEnd ? parseInt(timeEnd as string) : Math.floor(Date.now() / 1000),
    timeStart:
      time && TTimeOptions.includes(time) && timeStart
        ? parseInt(timeStart as string)
        : Math.floor(Date.now() / 1000) - 900,
  };
};

// formatNumber brings the given value returned by Prometheus as string into a format we can use in our ui.
export const formatNumber = (value: string, unit = '', dec = 4): string => {
  if (value === 'NaN') {
    return '-';
  }

  return `${Math.round(parseFloat(value) * Math.pow(10, dec)) / Math.pow(10, dec)} ${unit}`;
};
