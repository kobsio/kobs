import { Datum, Serie } from '@nivo/line';
import { BarDatum } from '@nivo/bar';

import { IAggregationData, IAggregationDataRow } from './interfaces';
import { formatTime } from '@kobsio/shared';

// formatAxisBottom calculates the format for the bottom axis based on the specified start and end time.
export const formatAxisBottom = (timeStart: number, timeEnd: number): string => {
  timeStart = Math.floor(timeStart / 1000);
  timeEnd = Math.floor(timeEnd / 1000);

  if (timeEnd - timeStart < 3600) {
    return '%H:%M:%S';
  } else if (timeEnd - timeStart < 86400) {
    return '%H:%M';
  } else if (timeEnd - timeStart < 604800) {
    return '%m-%d %H:%M';
  }

  return '%m-%d';
};

export const convertToBarChartTimeData = (data: IAggregationData): BarDatum[] => {
  const labelColumns = data.columns.filter((column) => !column.includes('_data') && column !== 'time');
  const dataColumns = data.columns.filter((column) => column.includes('_data'));

  // times is an array of all times returned from the API. This array is then used to create the bar data. We also have
  // to parse the time to convert the UTC formatted time to the local time.
  const times = data.rows
    .map((row) => formatTime(Math.floor(new Date(row.time as string).getTime() / 1000)))
    .filter((value, index, self) => self.indexOf(value) === index);

  return times.map((time) => {
    return {
      time: time,
      ...generateKeys(
        data.rows.filter((row) => formatTime(Math.floor(new Date(row.time as string).getTime() / 1000)) === time),
        labelColumns,
        dataColumns,
      ),
    };
  });
};

export const convertToBarChartTopData = (data: IAggregationData): { data: BarDatum[]; columns: string[] } => {
  const labelColumns = data.columns.filter((column) => !column.includes('_data'));
  const dataColumns = data.columns.filter((column) => column.includes('_data'));

  // To use the returned data from our API, we have to convert the data into the format used by the ResponsiveBarCanvas
  // component. For this we have to use the getLabel function to create a unique label for each series. All other key
  // value pairs can be used as they are returned.
  return {
    columns: dataColumns,
    data: data.rows.map((row) => {
      return {
        label: getLabel(row, labelColumns),
        ...row,
      };
    }),
  };
};

// convertToLineChartData converts the returned data from our API into the format required by the line chart component.
export const convertToLineChartData = (data: IAggregationData): Serie[] => {
  const labelColumns = data.columns.filter((column) => !column.includes('_data') && column !== 'time');
  const dataColumns = data.columns.filter((column) => column.includes('_data'));
  const labels = data.rows
    .map((row) => getLabel(row, labelColumns))
    .filter((value, index, self) => self.indexOf(value) === index);

  const series: Serie[] = [];
  for (const label of labels) {
    const rows = data.rows.filter((row) => label === getLabel(row, labelColumns));
    const seriesData: Datum[][] = dataColumns.map(() => []);

    for (const row of rows) {
      for (let i = 0; i < dataColumns.length; i++) {
        seriesData[i].push({
          filter: dataColumns[i],
          label: label,
          x: new Date(row.time as string),
          y: row.hasOwnProperty(dataColumns[i]) ? row[dataColumns[i]] : null,
        });
      }
    }

    for (let i = 0; i < seriesData.length; i++) {
      series.push({
        data: seriesData[i],
        id: `${label}-${dataColumns[i]}`,
      });
    }
  }

  return series;
};

// formatFilter returns a readable string for the applied filters.
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

const formatFilterValue = (filter: string, filters: string[]): string => {
  if (filter.startsWith('_filter')) {
    return filters[parseInt(filter.slice(-1))];
  }

  return filter;
};

// getLabel return a label for a row. For that we are joining the values of all columns which are not containing any
// data.
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

// generateKeys generates all the keys for a specific time from a list of rows. The passed in rows should all have the
// same time. The returned row, then have all the data columns as value, with the label for the row as key.
const generateKeys = (
  rows: IAggregationDataRow[],
  labelColumns: string[],
  dataColumns: string[],
): IAggregationDataRow => {
  const keys: IAggregationDataRow = {};

  for (const row of rows) {
    const label = getLabel(row, labelColumns);

    for (const dataColumn of dataColumns) {
      keys[`${label} - ${dataColumn}`] = row.hasOwnProperty(dataColumn) ? row[dataColumn] : null;
    }
  }

  return keys;
};
