import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';
import { ResponsiveLineCanvas } from '@nivo/line';

import { CHART_THEME, COLOR_SCALE, ChartTooltip } from '@kobsio/plugin-core';
import { convertMetric, formatAxisBottom, formatMetric } from '../../utils/helpers';
import { IMetric } from '../../utils/interfaces';
import { IPluginTimes } from '@kobsio/plugin-core';

interface IMetricProps {
  name: string;
  resourceGroup: string;
  provider: string;
  metricName: string;
  times: IPluginTimes;
}

const Metric: React.FunctionComponent<IMetricProps> = ({
  name,
  resourceGroup,
  provider,
  metricName,
  times,
}: IMetricProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IMetric, Error>(
    ['azure/monitor/metrics', name, resourceGroup, provider, metricName, times],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/azure/${name}/monitor/metrics?resourceGroup=${resourceGroup}&provider=${provider}&metricName=${metricName}&timeStart=${times.timeStart}&timeEnd=${times.timeEnd}`,
          {
            method: 'get',
          },
        );
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          if (json && json.length === 1) {
            return formatMetric(json[0]);
          }

          return null;
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
        title="Could not get metrics"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IMetric, Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <ResponsiveLineCanvas
      axisBottom={{
        format: formatAxisBottom(times.timeStart, times.timeEnd),
      }}
      axisLeft={{
        format: '>-.2f',
        legend: data.unit,
        legendOffset: -40,
        legendPosition: 'middle',
      }}
      colors={COLOR_SCALE}
      curve="monotoneX"
      data={convertMetric(data)}
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
            label={`${tooltip.point.serieId}: ${tooltip.point.data.yFormatted} ${data.unit}`}
            position={[0, 20]}
            title={tooltip.point.data.xFormatted.toString()}
          />
        );
      }}
      xScale={{ type: 'time' }}
      yScale={{ max: 'auto', min: 0, stacked: false, type: 'linear' }}
      yFormat=" >-.4f"
    />
  );
};

export default Metric;
