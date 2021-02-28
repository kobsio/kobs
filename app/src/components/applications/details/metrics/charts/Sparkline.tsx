import { ChartArea, ChartGroup } from '@patternfly/react-charts';
import React, { useEffect, useRef, useState } from 'react';

import { DatasourceMetrics } from 'generated/proto/datasources_pb';

export interface ISparklineProps {
  unit: string;
  metrics: DatasourceMetrics[];
}

// Sparkline displays a sparkline chart. The complete documentation for sparklines can be found in the Patternfly
// documentation https://www.patternfly.org/v4/charts/sparkline-chart. We also display the last/current value in the
// center of the sparkline, including the user defined unit.
const Sparkline: React.FunctionComponent<ISparklineProps> = ({ unit, metrics }: ISparklineProps) => {
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

  return (
    <div className="kobsio-chart-container-sparkline" ref={refChart}>
      <div className="kobsio-chart-container-sparkline-value">
        {metrics[0].getDataList()[metrics[0].getDataList().length - 1].getY()} {unit}
      </div>
      <ChartGroup height={height} padding={0} width={width}>
        {metrics.map((metric, index) => (
          <ChartArea key={index} data={metric.toObject().dataList} interpolation="monotoneX" name={`index${index}`} />
        ))}
      </ChartGroup>
    </div>
  );
};

export default Sparkline;
