import { IOptions, IVisualizationOptions } from './interfaces';
import { getTimeParams } from '@kobsio/plugin-core';

// getOptionsFromSearch is used to get the ClickHouse options from a given search location.
export const getOptionsFromSearch = (search: string): IOptions => {
  const params = new URLSearchParams(search);
  const fields = params.getAll('field');
  const order = params.get('order');
  const orderBy = params.get('orderBy');
  const query = params.get('query');

  return {
    fields: fields.length > 0 ? fields : undefined,
    order: order ? order : 'descending',
    orderBy: orderBy ? orderBy : '',
    query: query ? query : '',
    times: getTimeParams(params),
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

  return {
    chart: chart ? chart : 'bar',
    groupBy: groupBy ? groupBy : '',
    limit: limit ? limit : '10',
    operation: operation ? operation : 'count',
    operationField: operationField ? operationField : '',
    order: order ? order : 'descending',
    query: query ? query : '',
    times: getTimeParams(params),
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
