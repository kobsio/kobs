import { IAggregationData, IAggregationDataRow, ISeries, ISeriesDatum } from '../page/AggregationTypes';

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

const formatFilterValue = (filter: string, filters: string[]): string => {
  if (filter.startsWith('_filter')) {
    return filters[parseInt(filter.slice(-1))];
  }

  return filter;
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

// convertToTimeseriesChartData converts the returned data from our API into the format required by the line chart component.
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
          x: new Date(row.time as string),
          y: row.hasOwnProperty(dataColumns[i]) ? (row[dataColumns[i]] as number) : null,
        });
      }
    }

    for (let i = 0; i < seriesData.length; i++) {
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
