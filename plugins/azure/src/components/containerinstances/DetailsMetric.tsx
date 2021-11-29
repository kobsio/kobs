import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';
import { ResponsiveLineCanvas } from '@nivo/line';

import { CHART_THEME, COLOR_SCALE, ChartTooltip } from '@kobsio/plugin-core';
import { formatAxisBottom, formatMetrics } from '../../utils/helpers';
import { IMetric } from '../../utils/interfaces';
import { IPluginTimes } from '@kobsio/plugin-core';

interface IDetailsMetricProps {
  name: string;
  resourceGroup: string;
  containerGroup: string;
  metricName: string;
  times: IPluginTimes;
}

const DetailsMetric: React.FunctionComponent<IDetailsMetricProps> = ({
  name,
  resourceGroup,
  containerGroup,
  metricName,
  times,
}: IDetailsMetricProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IMetric[], Error>(
    ['azure/containergroups/containergroup/metrics', name, resourceGroup, containerGroup, metricName, times],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/azure/${name}/containerinstances/containergroup/metrics?resourceGroup=${resourceGroup}&containerGroup=${containerGroup}&metricName=${metricName}&timeStart=${times.timeStart}&timeEnd=${times.timeEnd}`,
          {
            method: 'get',
          },
        );
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          return json;
        } else {
          if (json.error) {
            throw new Error(json.error);
          } else {
            throw new Error('An unknown error occured');
          }
        }
      } catch (err) {
        throw err;
      }
    },
  );

  if (isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        variant={AlertVariant.danger}
        isInline={true}
        title="Could not get container group metrics"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IMetric[], Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data || data.length !== 1) {
    return null;
  }

  return (
    <ResponsiveLineCanvas
      axisBottom={{
        format: formatAxisBottom(times.timeStart, times.timeEnd),
      }}
      axisLeft={{
        format: '>-.2f',
        legend: data[0].unit,
        legendOffset: -40,
        legendPosition: 'middle',
      }}
      colors={COLOR_SCALE}
      curve="monotoneX"
      data={formatMetrics(data[0])}
      enableArea={true}
      enableGridX={false}
      enableGridY={true}
      enablePoints={false}
      xFormat="time:%Y-%m-%d %H:%M:%S"
      lineWidth={1}
      margin={{ bottom: 25, left: 50, right: 0, top: 0 }}
      theme={CHART_THEME}
      // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
      tooltip={(tooltip) => {
        const isFirstHalf =
          new Date(tooltip.point.data.x).getTime() < (times.timeStart * 1000 + times.timeEnd * 1000) / 2;

        return (
          <ChartTooltip
            anchor={isFirstHalf ? 'right' : 'left'}
            color={tooltip.point.color}
            label={`${tooltip.point.data.yFormatted} ${data[0].unit}`}
            position={[0, 20]}
            title={tooltip.point.data.xFormatted.toString()}
          />
        );
      }}
      xScale={{ type: 'time' }}
      yScale={{ max: 'auto', min: 'auto', stacked: false, type: 'linear' }}
      yFormat=" >-.4f"
    />
  );
};

export default DetailsMetric;
