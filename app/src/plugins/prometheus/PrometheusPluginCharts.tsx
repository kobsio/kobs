import { Grid, GridItem, Title, gridSpans } from '@patternfly/react-core';
import React, { useEffect, useRef, useState } from 'react';

import { Chart, Variable } from 'proto/prometheus_grpc_web_pb';
import { ITimes } from 'plugins/prometheus/helpers';
import PrometheusPluginChart from 'plugins/prometheus/PrometheusPluginChart';

interface IPrometheusPluginChartsProps {
  name: string;
  times: ITimes;
  variables: Variable.AsObject[];
  charts: Chart.AsObject[];
}

// PrometheusPluginCharts renders a Grid of the user defined charts for an applicatication. The grid contains a small
// padding to the toolbar, which is rendered above. When the width of the grid is larger then 1200px, we apply the user
// defined size for each chart. If the width is below this value each chart will be rendered accross the complete width
// of the grid.
const PrometheusPluginCharts: React.FunctionComponent<IPrometheusPluginChartsProps> = ({
  name,
  times,
  variables,
  charts,
}: IPrometheusPluginChartsProps) => {
  const refGrid = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(0);

  // useEffect is executed on every render, to determin the size of the grid and apply the user defined size for charts
  // if necessary.
  useEffect(() => {
    if (refGrid && refGrid.current) {
      setWidth(refGrid.current.getBoundingClientRect().width);
    }
  }, []);

  return (
    <div style={{ marginTop: '16px' }} ref={refGrid}>
      <Grid hasGutter={true}>
        {charts.map((chart, index) => (
          <GridItem
            key={index}
            span={
              width >= 1200 && chart.size > 0 && chart.size <= 12 && chart.type !== 'divider'
                ? (chart.size as gridSpans)
                : 12
            }
          >
            {chart.type === 'divider' ? (
              <Title headingLevel="h6" size="lg">
                {chart.title}
              </Title>
            ) : (
              <PrometheusPluginChart name={name} times={times} variables={variables} chart={chart} />
            )}
          </GridItem>
        ))}
      </Grid>
    </div>
  );
};

export default PrometheusPluginCharts;
