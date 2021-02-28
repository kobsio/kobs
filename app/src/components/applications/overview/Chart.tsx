import { ChartArea, ChartGroup } from '@patternfly/react-charts';
import React, { useEffect, useRef, useState } from 'react';

import { DatasourceMetrics } from 'generated/proto/datasources_pb';

export interface IChartProps {
  title?: string;
  unit?: string;
  metrics: DatasourceMetrics[];
}

// Chart is used to render a sparkline on the card of an application in the overview gallery. Above the sparkline we
// show the last/current value of the metric and the chart title.
const Chart: React.FunctionComponent<IChartProps> = ({ title, unit, metrics }: IChartProps) => {
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
    <React.Fragment>
      <div className="pf-u-font-size-lg pf-u-text-nowrap pf-u-text-truncate">
        {metrics[0].getDataList()[metrics[0].getDataList().length - 1].getY().toFixed(2)} {unit ? unit : ''}
      </div>
      {title ? (
        <div className="pf-u-font-size-sm pf-u-color-400  pf-u-text-nowrap pf-u-text-truncates">{title}</div>
      ) : null}

      <div className="kobsio-chart-container-sparkline small" ref={refChart}>
        <ChartGroup height={height} padding={0} width={width}>
          {metrics.map((metric, index) => (
            <ChartArea key={index} data={metric.toObject().dataList} interpolation="monotoneX" name={`index${index}`} />
          ))}
        </ChartGroup>
      </div>
    </React.Fragment>
  );
};

export default Chart;
