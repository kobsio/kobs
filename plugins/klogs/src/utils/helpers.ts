import { IAggregationOptions, IAggregationOptionsAggregation, IOptions } from './interfaces';
import { getTimeParams } from '@kobsio/plugin-core';

// getInitialOptions is used to get the initial klogs options from the url.
export const getInitialOptions = (): IOptions => {
  const params = new URLSearchParams(window.location.search);
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

// getInitialAggregationOptions is used to get the initial options for an aggregation from the url.
export const getInitialAggregationOptions = (): IAggregationOptions => {
  const params = new URLSearchParams(window.location.search);

  const chart = params.get('chart');
  const query = params.get('query');
  const aggregationParams = params.get('aggregation');

  try {
    let aggregationOptions = aggregationOptionDefaults;
    if (aggregationParams) {
      aggregationOptions = { ...aggregationOptions, ...JSON.parse(aggregationParams) };
    }

    return {
      chart: chart ? chart : 'pie',
      options: aggregationOptions,
      query: query ? query : '',
      times: getTimeParams(params),
    };
  } catch (err) {
    return {
      chart: chart ? chart : 'pie',
      options: aggregationOptionDefaults,
      query: query ? query : '',
      times: getTimeParams(params),
    };
  }
};

export const aggregationOptionDefaults: IAggregationOptionsAggregation = {
  breakDownByFields: [],
  breakDownByFilters: [],

  horizontalAxisField: '',
  horizontalAxisLimit: '',
  horizontalAxisOperation: 'time',
  horizontalAxisOrder: 'ascending',

  sizeByField: '',
  sizeByOperation: 'count',
  sliceBy: '',

  verticalAxisField: '',
  verticalAxisOperation: 'count',
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
