import { Theme } from '@mui/material';
import {
  red,
  pink,
  purple,
  deepPurple,
  indigo,
  blue,
  lightBlue,
  cyan,
  teal,
  green,
  lightGreen,
  lime,
  yellow,
  amber,
  orange,
  deepOrange,
} from '@mui/material/colors';
import { VictoryThemeDefinition } from 'victory';

/**
 * `chartTickFormatTime` can be used to format a `tick` in a chart where the x axis is time based.
 */
export const chartTickFormatTime = (tick: Date): string => {
  return `${('0' + (tick.getMonth() + 1)).slice(-2)}-${('0' + tick.getDate()).slice(-2)} ${(
    '0' + tick.getHours()
  ).slice(-2)}:${('0' + tick.getMinutes()).slice(-2)}:${('0' + tick.getSeconds()).slice(-2)}`;
};

/**
 * `chartTickFormatValue` can be used to format a `tick` in a chart where the y axis is numeric.
 */
export const chartTickFormatValue = (tick: number, dec = 3): string => {
  const rx = /\.0+$|(\.[0-9]*[1-9])0+$/;
  const si = [
    { symbol: '', value: 1 },
    { symbol: 'K', value: 1e3 },
    { symbol: 'M', value: 1e6 },
    { symbol: 'G', value: 1e9 },
    { symbol: 'T', value: 1e12 },
    { symbol: 'P', value: 1e15 },
    { symbol: 'E', value: 1e18 },
  ];

  let i;
  for (i = si.length - 1; i > 0; i--) {
    if (Math.abs(tick) >= si[i].value) {
      break;
    }
  }

  return (tick / si[i].value).toFixed(dec).replace(rx, '$1') + si[i].symbol;
};

/**
 * `chartColors` is a list of chart colors, the first color should be the primary color of the MUI theme, so that it is
 * the default color in a chart.
 */
export const chartColors = [
  '#407ad6',
  red[500],
  green[500],
  yellow[500],
  pink[500],
  purple[500],
  orange[500],
  blue[500],
  amber[500],
  teal[500],
  indigo[500],
  deepOrange[500],
  deepPurple[500],
  cyan[500],
  lightBlue[500],
  lightGreen[500],
  lime[500],
];

/**
 * `getChartColor` returns the correct color for a given index. The function is mainly used by the legend for an chart, so
 * that we can split the legend and chart into separate components.
 */
export const getChartColor = (index: number): string => {
  return chartColors[index % chartColors.length];
};

/**
 * `chartTheme` returns a `VictoryThemeDefinition` which can be used within a Victory chart, to use the same styling
 * for charts across the app. The chart theme is created based on the provided MUI `theme`.
 */
export const chartTheme = (theme: Theme): VictoryThemeDefinition => ({
  area: {
    style: {
      data: {
        fillOpacity: 0.5,
      },
    },
  },
  axis: {
    style: {
      axis: {
        fill: 'transparent',
        stroke: theme.palette.text.secondary,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 1,
      },
      axisLabel: {
        fill: theme.palette.text.secondary,
        fontFamily: theme.typography.fontFamily,
        fontSize: 12,
        fontWeight: 'bold',
        letterSpacing: 'normal',
        padding: 45,
        stroke: 'transparent',
        strokeWidth: 0,
        textAnchor: 'middle',
      },
      grid: {
        fill: 'none',
        pointerEvents: 'painted',
        stroke: theme.palette.text.secondary,
        strokeDasharray: '10, 5',
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
      },
      tickLabels: {
        fill: theme.palette.text.secondary,
        fontFamily: theme.typography.fontFamily,
        fontSize: 12,
        letterSpacing: 'normal',
        padding: 8,
        stroke: 'transparent',
        strokeWidth: 0,
      },
      ticks: {
        fill: 'transparent',
        size: 5,
        stroke: theme.palette.text.secondary,
        strokeLinecap: 'round',
        strokeLinejoin: 'round',
        strokeWidth: 1,
      },
    },
  },
  group: {
    colorScale: chartColors,
  },
  legend: {
    colorScale: chartColors,
  },
  pie: {
    colorScale: chartColors,
  },
  stack: {
    colorScale: chartColors,
  },
  tooltip: {
    cornerRadius: 0,
    flyoutPadding: 0,
    flyoutStyle: {
      fill: 'none',
      pointerEvents: 'none',
      strokeWidth: 0,
    },
    pointerLength: 10,
    style: {
      fill: theme.palette.text.secondary,
      fontFamily: theme.typography.fontFamily,
      fontSize: 12,
      letterSpacing: 'normal',
      padding: 0,
      pointerEvents: 'none',
      stroke: 'transparent',
      strokeWidth: 0,
    },
  },
});
