import { IOptions, IVisualizationOptions } from './interfaces';
import { TTime, TTimeOptions } from '@kobsio/plugin-core';

// getOptionsFromSearch is used to get the ClickHouse options from a given search location.
export const getOptionsFromSearch = (search: string): IOptions => {
  const params = new URLSearchParams(search);
  const fields = params.getAll('field');
  const order = params.get('order');
  const orderBy = params.get('orderBy');
  const query = params.get('query');
  const time = params.get('time');
  const timeEnd = params.get('timeEnd');
  const timeStart = params.get('timeStart');

  return {
    fields: fields.length > 0 ? fields : undefined,
    order: order ? order : 'ascending',
    orderBy: orderBy ? orderBy : '',
    query: query ? query : '',
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

// getOptionsFromSearch is used to get the ClickHouse options for a visualization from a given search location.
export const getVisualizationOptionsFromSearch = (search: string): IVisualizationOptions => {
  const params = new URLSearchParams(search);

  const chart = params.get('chart');
  const limit = params.get('limit');
  const groupBy = params.get('groupBy');
  const operation = params.get('operation');
  const operationField = params.get('operationField');
  const order = params.get('order');
  const query = params.get('query');
  const time = params.get('time');
  const timeEnd = params.get('timeEnd');
  const timeStart = params.get('timeStart');

  return {
    chart: chart ? chart : 'bar',
    groupBy: groupBy ? groupBy : '',
    limit: limit ? limit : '10',
    operation: operation ? operation : 'count',
    operationField: operationField ? operationField : '',
    order: order ? order : 'ascending',
    query: query ? query : '',
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

// formatTime formate the given time string. We do not use the formatTime function from the core package, because we
// also want to include milliseconds in the logs timestamp, which we show.
export const formatTime = (time: string): string => {
  const d = new Date(time);
  return `${d.getFullYear()}-${('0' + (d.getMonth() + 1)).slice(-2)}-${('0' + d.getDate()).slice(-2)} ${(
    '0' + d.getHours()
  ).slice(-2)}:${('0' + d.getMinutes()).slice(-2)}:${('0' + d.getSeconds()).slice(-2)}.${(
    '00' + d.getMilliseconds()
  ).slice(-3)}`;
};
