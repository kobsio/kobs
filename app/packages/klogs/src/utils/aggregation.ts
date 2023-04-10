import { TTime } from '@kobsio/core';
import { getChartColor } from '@kobsio/core';

/**
 * `IAggregationOptions` is the interface for an aggragation. It contains the query to select the logs, the time range
 * and some chart specify options:
 *   - The "sliceBy", "sizeByOperation" and "sizeByField" is required, when a user choosed a pie chart as visualization
 *     type. The latter one is only needed if the user did not choose "count" for "sizeByOperation".
 *   - The values for the horizontal axis are needed for the bar, line and area chart. The "horizontalAxisField",
 *     "horizontalAxisOrder" and "horizontalAxisLimit" can only be set, when the "horizontalAxisOperation" is "top".
 *   - For the vertical axis we need to now the "verticalAxisOperation" and "verticalAxisField" values, where the latter
 *     one is only required when the "verticalAxisOperation" is not "count"
 *   - Finally the user can also break down his aggregation, via a list of fields ("breakDownByFields") or a list of
 *     filters ("breakDownByFilters").
 */
export interface IAggregationOptions {
  breakDownByFields: string[];
  breakDownByFilters: string[];
  chart: string;
  horizontalAxisField: string;
  horizontalAxisLimit: number;
  horizontalAxisOperation: string;
  horizontalAxisOrder: string;
  query: string;
  sizeByField: string;
  sizeByOperation: string;
  sliceBy: string;
  time: TTime;
  timeEnd: number;
  timeStart: number;
  verticalAxisField: string;
  verticalAxisOperation: string;
}

/**
 * `IAggregationDataRow` is the interface for a single row returned by the aggregation API. It contains the column name
 * as key and the cell value for the row/column as value. The value could be a string, for the selected fields in the
 * aggregation or a number for the value of the fields combination.
 */
export interface IAggregationDataRow {
  [key: string]: string | number | null;
}

/**
 * `IAggregationData` is the data returned by the aggregation API call. It contains a list of columns and a list of
 * rows.
 */
export interface IAggregationData {
  columns: string[];
  rows: IAggregationDataRow[];
}

export interface ISeries {
  data: ISeriesDatum[];
  name: string;
}

export interface ISeriesDatum {
  color: string;
  series: string;
  x: Date;
  y: number | null;
}

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

      for (let di = 0; di < seriesData[i].length; di++) {
        seriesData[i][di].series = name;
      }

      series.push({
        data: seriesData[i],
        name: label
          ? `${label} - ${formatFilter(dataColumns[i], filters)}`
          : `${formatFilter(dataColumns[i], filters)}`,
      });
    }
  }

  // assign color values retroactively
  for (let i = 0; i < series.length; i++) {
    const color = getChartColor(i);
    for (let j = 0; j < series[i].data.length; j++) {
      series[i].data[j].color = color;
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
