import chart_color_blue_100 from '@patternfly/react-tokens/dist/js/chart_color_blue_100';
import chart_color_blue_200 from '@patternfly/react-tokens/dist/js/chart_color_blue_200';
import chart_color_blue_300 from '@patternfly/react-tokens/dist/js/chart_color_blue_300';
import chart_color_blue_400 from '@patternfly/react-tokens/dist/js/chart_color_blue_400';
import chart_color_blue_500 from '@patternfly/react-tokens/dist/js/chart_color_blue_500';
import chart_color_cyan_100 from '@patternfly/react-tokens/dist/js/chart_color_cyan_100';
import chart_color_cyan_200 from '@patternfly/react-tokens/dist/js/chart_color_cyan_200';
import chart_color_cyan_300 from '@patternfly/react-tokens/dist/js/chart_color_cyan_300';
import chart_color_cyan_400 from '@patternfly/react-tokens/dist/js/chart_color_cyan_400';
import chart_color_cyan_500 from '@patternfly/react-tokens/dist/js/chart_color_cyan_500';
import chart_color_gold_100 from '@patternfly/react-tokens/dist/js/chart_color_gold_100';
import chart_color_gold_200 from '@patternfly/react-tokens/dist/js/chart_color_gold_200';
import chart_color_gold_300 from '@patternfly/react-tokens/dist/js/chart_color_gold_300';
import chart_color_gold_400 from '@patternfly/react-tokens/dist/js/chart_color_gold_400';
import chart_color_gold_500 from '@patternfly/react-tokens/dist/js/chart_color_gold_500';
import chart_color_green_100 from '@patternfly/react-tokens/dist/js/chart_color_green_100';
import chart_color_green_200 from '@patternfly/react-tokens/dist/js/chart_color_green_200';
import chart_color_green_300 from '@patternfly/react-tokens/dist/js/chart_color_green_300';
import chart_color_green_400 from '@patternfly/react-tokens/dist/js/chart_color_green_400';
import chart_color_green_500 from '@patternfly/react-tokens/dist/js/chart_color_green_500';
import chart_color_orange_100 from '@patternfly/react-tokens/dist/js/chart_color_orange_100';
import chart_color_orange_200 from '@patternfly/react-tokens/dist/js/chart_color_orange_200';
import chart_color_orange_300 from '@patternfly/react-tokens/dist/js/chart_color_orange_300';
import chart_color_orange_400 from '@patternfly/react-tokens/dist/js/chart_color_orange_400';
import chart_color_orange_500 from '@patternfly/react-tokens/dist/js/chart_color_orange_500';

// We are using the multi color ordered theme from Patternfly for the charts.
// See: https://github.com/patternfly/patternfly-react/blob/main/packages/react-charts/src/components/ChartTheme/themes/light/multi-color-ordered-theme.ts
export const COLOR_SCALE = [
  chart_color_blue_300.value,
  chart_color_green_300.value,
  chart_color_cyan_300.value,
  chart_color_gold_300.value,
  chart_color_orange_300.value,
  chart_color_blue_100.value,
  chart_color_green_500.value,
  chart_color_cyan_100.value,
  chart_color_gold_100.value,
  chart_color_orange_500.value,
  chart_color_blue_500.value,
  chart_color_green_100.value,
  chart_color_cyan_500.value,
  chart_color_gold_500.value,
  chart_color_orange_100.value,
  chart_color_blue_200.value,
  chart_color_green_400.value,
  chart_color_cyan_200.value,
  chart_color_gold_200.value,
  chart_color_orange_400.value,
  chart_color_blue_400.value,
  chart_color_green_200.value,
  chart_color_cyan_400.value,
  chart_color_gold_400.value,
  chart_color_orange_200.value,
];

// getColor returns the correct color for a given index. The function is mainly used by the legend for an chart, so that
// we can split the legend and chart into separate components.
export const getColor = (index: number): string => {
  return COLOR_SCALE[index % COLOR_SCALE.length];
};
