import { Chart, ChartArea, ChartGroup, ChartThemeColor } from '@patternfly/react-charts';
import React, { useRef } from 'react';

import { IMappings, IMetric, IQuery } from '../../utils/interfaces';
import { ITimes, useDimensions } from '@kobsio/shared';
import { getMappingValue, roundNumber } from '../../utils/helpers';

interface IChartSpakrlineProps {
  queries: IQuery[];
  metrics: IMetric[];
  unit?: string;
  mappings?: IMappings;
  times: ITimes;
}

export const ChartSpakrline: React.FunctionComponent<IChartSpakrlineProps> = ({
  metrics,
  queries,
  unit,
  mappings,
  times,
}: IChartSpakrlineProps) => {
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);

  // Determine the label which should be shown above the chart. This is the last value in first metric of the returned
  // data or a value from the user specified mappings.
  let label = 'N/A';
  if (queries && Array.isArray(queries) && queries.length > 0 && queries[0].label) {
    if (metrics[0].label) {
      label = metrics[0].label;
    }
  } else {
    if (mappings && Object.keys(mappings).length > 0) {
      label = getMappingValue(metrics[0].data[metrics[0].data.length - 1].y, mappings);
    } else {
      label =
        metrics[0].data[metrics[0].data.length - 1].y === null
          ? 'N/A'
          : `${roundNumber(metrics[0].data[metrics[0].data.length - 1].y as number)} ${unit ? unit : ''}`;
    }
  }

  return (
    <React.Fragment>
      <div style={{ height: '100%', position: 'relative' }}>
        <div style={{ fontSize: '24px', position: 'absolute', textAlign: 'center', top: '31px', width: '100%' }}>
          {label}
        </div>
        <div style={{ height: '100%', width: '100%' }} ref={refChart}>
          <Chart
            height={chartSize.height}
            padding={{ bottom: 0, left: 0, right: 0, top: 0 }}
            scale={{ x: 'time', y: 'linear' }}
            themeColor={ChartThemeColor.multiOrdered}
            width={chartSize.width}
            domain={{ x: [new Date(times.timeStart * 1000), new Date(times.timeEnd * 1000)] }}
          >
            <ChartGroup>
              <ChartArea
                key={metrics[0].label}
                data={metrics[0].data.map((datum) => {
                  return {
                    x: new Date(datum.x),
                    y: datum.y,
                  };
                })}
                name={metrics[0].label}
                interpolation="monotoneX"
              />
            </ChartGroup>
          </Chart>
        </div>
      </div>
    </React.Fragment>
  );
};

export default ChartSpakrline;
