import { useTheme } from '@mui/material';
import { Box } from '@mui/system';
import { init, registerTheme, getInstanceByDom } from 'echarts';
import { useRef, useEffect, FunctionComponent } from 'react';

import type { EChartsOption, ECharts, SetOptionOpts } from 'echarts';

import theme from './chart-theme';

import { useDimensions } from '../../../utils/hooks/useDimensions';

interface IDataZoomPayload {
  batch: [
    {
      dataZoomId: string;
      end: number;
      endValue: number;
      from: string;
      start: number;
      startValue: number;
      type: 'datazoom';
    },
  ];
  type: 'datazoom';
}

interface IEventCallbacks {
  datazoom?: (payload: IDataZoomPayload) => void;
}

export interface IEChartProps {
  /**
   * map with callbacks for various events that echarts emits.
   * The key must be the name of the event to listen on.
   * documentation of echarts events: https://apache.github.io/echarts-handbook/en/concepts/event/
   **/
  eventListener?: IEventCallbacks;
  /**
   * this callback is executed when the chart is ready.
   **/
  onChartReady?: (chart: ECharts) => void;
  option: EChartsOption;
  settings?: SetOptionOpts;
}

// Chart is a wrapper around apaches echart
// https://dev.to/manufac/using-apache-echarts-with-react-and-typescript-353k
export const Chart: FunctionComponent<IEChartProps> = ({ eventListener, onChartReady, option, settings }) => {
  const chartRef = useRef<HTMLDivElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dimensions = useDimensions(wrapperRef);
  const muiTheme = useTheme();

  useEffect(() => {
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      chart?.resize();
    }
  }, [dimensions]);

  useEffect(() => {
    let chart: ECharts | undefined;
    if (chartRef.current !== null) {
      registerTheme('kobs', { ...theme, color: [muiTheme.palette.primary.main] });
      chart = init(chartRef.current, 'kobs');
    }

    return () => {
      chart?.dispose();
    };
  }, [muiTheme]);

  useEffect(() => {
    // Update chart
    if (chartRef.current !== null) {
      const chart = getInstanceByDom(chartRef.current);
      chart?.setOption(option, settings);

      if (eventListener) {
        for (const [eventName, eventHandler] of Object.entries(eventListener)) {
          chart?.on(eventName, eventHandler);
        }
      }

      chart && onChartReady && onChartReady(chart);
    }
  }, [eventListener, onChartReady, option, settings]); // Whenever theme changes we need to add option and setting due to it being deleted in cleanup function

  return (
    <Box ref={wrapperRef} style={{ height: '100%', width: '100%' }}>
      <Box ref={chartRef} sx={{ height: dimensions.height, width: dimensions.width }} />
    </Box>
  );
};
