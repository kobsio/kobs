import { Box } from '@mui/system';
import { init, registerTheme, getInstanceByDom } from 'echarts';
import { useRef, useEffect, FunctionComponent } from 'react';

import type { EChartsOption, ECharts, SetOptionOpts } from 'echarts';

import theme from './chart-theme';

import { useDimensions } from '../../../utils/hooks/useDimensions';

export interface IEChartProps {
  option: EChartsOption;
  settings?: SetOptionOpts;
}

// Chart is a wrapper around apaches echart
// https://dev.to/manufac/using-apache-echarts-with-react-and-typescript-353k
export const Chart: FunctionComponent<IEChartProps> = ({ option, settings }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dimensions = useDimensions(wrapperRef);

  useEffect(() => {
    if (chartRef.current !== null) {
      console.log(dimensions);
      const chart = getInstanceByDom(chartRef.current);
      chart?.resize();
    }
  }, [dimensions]);

  useEffect(() => {
    // Initialize chart
    let chart: ECharts | undefined;
    if (chartRef.current !== null) {
      registerTheme('chalk', theme);
      chart = init(chartRef.current, 'chalk');
    }

    // Return cleanup function
    return () => {
      chart?.dispose();
    };
  }, []);

  useEffect(() => {
    // Update chart
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      chart?.setOption({ ...option }, settings);
    }
  }, [option, settings]); // Whenever theme changes we need to add option and setting due to it being deleted in cleanup function

  return (
    <Box ref={wrapperRef} style={{ height: '100%', width: '100%' }}>
      <Box ref={chartRef} sx={{ height: dimensions.height, width: dimensions.width }} />
    </Box>
  );
};
