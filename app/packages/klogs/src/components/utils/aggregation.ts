import { getChartColor } from '@kobsio/core';

import { IAggregationData, IAggregationDataRow, IChartOptions, ISeries, ISeriesDatum } from '../page/AggregationTypes';

/**
 * getLabel return a label for a row. For that we are joining the values of all columns which are not containing any data.
 **/
const getLabel = (row: IAggregationDataRow, columns: string[]): string => {
  let label = '';

  for (const column of columns) {
    if (label === '') {
      label = `${row[column]}`;
    } else {
      label = `${label} - ${row[column]}`;
    }
  }

  return label;
};

const formatFilterValue = (filter: string, filters: string[]): string => {
  if (filter.startsWith('_filter')) {
    return filters[parseInt(filter.slice(-1))];
  }

  return filter;
};

/**
 * formatFilter returns a readable string for the applied filters.
 */
export const formatFilter = (filter: string, filters: string[]): string => {
  const filterParts = filter.split('_data');
  let formattedFilter = '';

  for (const f of filterParts) {
    if (f !== '') {
      if (formattedFilter === '') {
        formattedFilter = formatFilterValue(f, filters);
      } else {
        formattedFilter = `${formattedFilter} - ${formatFilterValue(f, filters)}`;
      }
    }
  }

  return formattedFilter;
};

/**
 * convertToTimeseriesChartData converts the returned data from our API into the format required by the line chart component.
 */
export const convertToTimeseriesChartData = (data: IAggregationData, filters: string[]): ISeries[] => {
  const labelColumns = data.columns.filter((column) => !column.includes('_data') && column !== 'time');
  const dataColumns = data.columns.filter((column) => column.includes('_data'));
  const labels = data.rows
    .map((row) => getLabel(row, labelColumns))
    .filter((value, index, self) => self.indexOf(value) === index);

  const series: ISeries[] = [];

  for (const label of labels) {
    const rows = data.rows.filter((row) => label === getLabel(row, labelColumns));
    const seriesData: ISeriesDatum[][] = dataColumns.map(() => []);

    for (const row of rows) {
      for (let i = 0; i < dataColumns.length; i++) {
        seriesData[i].push({
          // both color and series are set in the lines below, because we don't have access to the filters and labels yet
          color: '',
          series: '',
          x: new Date(row.time as string),
          y: row.hasOwnProperty(dataColumns[i]) ? (row[dataColumns[i]] as number) : null,
        });
      }
    }

    for (let i = 0; i < seriesData.length; i++) {
      const name = label
        ? `${label} - ${formatFilter(dataColumns[i], filters)}`
        : `${formatFilter(dataColumns[i], filters)}`;
      const color = getChartColor(i);

      const data = seriesData[i];
      for (let di = 0; di < data.length; di++) {
        data[di].color = color;
        data[di].series = name;
      }

      series.push({
        data: seriesData[i],
        name: label
          ? `${label} - ${formatFilter(dataColumns[i], filters)}`
          : `${formatFilter(dataColumns[i], filters)}`,
      });
    }
  }

  return series;
};

interface IBarTopChartLegend {
  legend: { name: string }[];
}
interface IBarChartTopData {
  metrics: {
    label: string;
    name: string;
    x: string;
    y: number;
  }[][];
}

export const convertToBarChartTopData = (
  data: IAggregationData,
  filters: string[],
): IBarTopChartLegend & IBarChartTopData => {
  const labelColumns = data.columns.filter((column) => !column.includes('_data'));
  const dataColumns = data.columns.filter((column) => column.includes('_data'));

  // To use the returned data from our API, we have to convert the data into the format used by the ResponsiveBarCanvas
  // component. For this we have to use the getLabel function to create a unique label for each series. All other key
  // value pairs can be used as they are returned.
  return {
    legend: dataColumns.map((column) => {
      return { name: column };
    }),
    metrics: dataColumns.map((column) =>
      data.rows.map((row) => {
        return {
          label: getLabel(row, labelColumns) + ' - ' + row[column],
          name: formatFilter(getLabel(row, labelColumns) + ' ' + column, filters),
          x: formatFilter(getLabel(row, labelColumns) + ' ' + column, filters),
          y: row[column] as number,
        };
      }),
    ),
  };
};

export const chartFormatLabel = (label: string, minLength = 12): string => {
  if (label.length < minLength) {
    return `${' '.repeat(minLength - label.length)}${label}`;
  }

  return label;
};

/**
 * utility for transforming the IChartOptions interface to request options
 * this method can throw an error, when one of the required options is missing
 */
export const chartOptionsToRequestOptions = (chartOptions: IChartOptions): unknown => {
  let options: unknown = undefined;
  if (chartOptions.chart === 'pie') {
    if (!chartOptions.sliceBy) {
      throw new Error('please provide a column name for "Slice By"');
    }
    options = {
      sizeByField: chartOptions.sizeByField,
      sizeByOperation: chartOptions.sizeByOperation,
      sliceBy: chartOptions.sliceBy,
    };
  } else if (chartOptions.chart === 'bar' && chartOptions.horizontalAxisOperation === 'top') {
    if (!chartOptions.horizontalAxisField) {
      throw new Error('please provide a column name for "Horizontal axis field"');
    }

    if (!chartOptions.horizontalAxisLimit || Number.isNaN(Number(chartOptions.horizontalAxisLimit))) {
      throw new Error('please provide a valid value for "Horizontal axis limit" - must be a number');
    }

    options = {
      breakDownByFields: chartOptions.breakDownByFields,
      breakDownByFilters: chartOptions.breakDownByFilters,
      horizontalAxisField: chartOptions.horizontalAxisField,
      horizontalAxisLimit: `${chartOptions.horizontalAxisLimit}`,
      horizontalAxisOperation: 'top',
      horizontalAxisOrder: chartOptions.horizontalAxisOrder || 'ascending',
      verticalAxisOperation: chartOptions.verticalAxisOperation,
    };
  } else {
    if (!chartOptions.horizontalAxisOperation) {
      throw new Error('please provide a column name for "Horizontal axis Operation"');
    }

    if (chartOptions.verticalAxisOperation !== 'count' && !chartOptions.verticalAxisField) {
      throw new Error(
        `when "Vertical axis Operation" is set to "${chartOptions.verticalAxisOperation}", you have to pick a column name for "Vertical axis Field"`,
      );
    }

    options = {
      breakDownByFields: chartOptions.breakDownByFields,
      breakDownByFilters: chartOptions.breakDownByFilters,
      horizontalAxisOperation: chartOptions.horizontalAxisOperation,
      verticalAxisField: chartOptions.verticalAxisField,
      verticalAxisOperation: chartOptions.verticalAxisOperation,
    };
  }

  return options;
};
