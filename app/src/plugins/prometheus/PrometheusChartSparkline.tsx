import { ChartArea, ChartGroup } from '@patternfly/react-charts';
import React, { useEffect, useRef, useState } from 'react';

import { Metrics } from 'proto/prometheus_grpc_web_pb';

export interface IPrometheusChartSparklineProps {
  unit: string;
  metrics: Metrics.AsObject[];
}

// PrometheusChartSparkline displays a sparkline chart. The complete documentation for sparklines can be found in the
// Patternfly documentation https://www.patternfly.org/v4/charts/sparkline-chart. We also display the last/current value
// in the center of the sparkline, including the user defined unit.
const PrometheusChartSparkline: React.FunctionComponent<IPrometheusChartSparklineProps> = ({
  unit,
  metrics,
}: IPrometheusChartSparklineProps) => {
  const refChart = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(0);
  const [height, setHeight] = useState<number>(0);

  // useEffect is executed on every render of this component. This is needed, so that we are able to use a width of 100%
  // and a static height for the chart.
  useEffect(() => {
    if (refChart && refChart.current) {
      setWidth(refChart.current.getBoundingClientRect().width);
      setHeight(refChart.current.getBoundingClientRect().height);
    }
  }, []);

  // When the component doesn't received any metrics we do not render anything.
  if (metrics.length === 0) {
    return null;
  }

  return (
    <div style={{ height: '150px', position: 'relative', width: '100%' }} ref={refChart}>
      <div style={{ fontSize: '24px', position: 'absolute', textAlign: 'center', top: '63px', width: '100%' }}>
        {metrics[0].dataList[metrics[0].dataList.length - 1].y} {unit}
      </div>
      <ChartGroup height={height} padding={0} width={width}>
        {metrics.map((metric, index) => (
          <ChartArea key={index} data={metric.dataList} interpolation="monotoneX" name={`index${index}`} />
        ))}
      </ChartGroup>
    </div>
  );
};

export default PrometheusChartSparkline;
