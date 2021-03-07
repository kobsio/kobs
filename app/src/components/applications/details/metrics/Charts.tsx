import { Grid, GridItem, Title, gridSpans } from '@patternfly/react-core';
import React, { useEffect, useRef, useState } from 'react';

import { IApplicationMetricsVariable, IDatasourceOptions } from 'utils/proto';
import { ApplicationMetricsChart } from 'generated/proto/application_pb';
import Chart from 'components/applications/details/metrics/Chart';

interface IChartsProps {
  datasourceName: string;
  datasourceType: string;
  datasourceOptions: IDatasourceOptions;
  variables: IApplicationMetricsVariable[];
  charts: ApplicationMetricsChart[];
}

// Charts renders a Grid of the user defined charts for an applicatication. The grid contains a small padding to the
// toolbar, which is rendered above. When the width of the grid is larger then 1200px, we apply the user defined size
// for each chart. If the width is below this value each chart will be rendered accross the complete width of the grid.
const Charts: React.FunctionComponent<IChartsProps> = ({
  datasourceName,
  datasourceType,
  datasourceOptions,
  variables,
  charts,
}: IChartsProps) => {
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
    <div className="kobsio-charts-grid" ref={refGrid}>
      <Grid hasGutter={true}>
        {charts.map((chart, index) => (
          <GridItem
            key={index}
            span={
              width >= 1200 && chart.getSize() > 0 && chart.getSize() <= 12 && chart.getType() !== 'divider'
                ? (chart.getSize() as gridSpans)
                : 12
            }
          >
            {chart.getType() === 'divider' ? (
              <Title headingLevel="h6" size="lg">
                {chart.getTitle()}
              </Title>
            ) : (
              <Chart
                datasourceName={datasourceName}
                datasourceType={datasourceType}
                datasourceOptions={datasourceOptions}
                variables={variables}
                chart={chart}
              />
            )}
          </GridItem>
        ))}
      </Grid>
    </div>
  );
};

export default Charts;
