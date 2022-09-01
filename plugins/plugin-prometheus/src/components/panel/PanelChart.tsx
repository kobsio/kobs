import { Alert, AlertActionLink, AlertVariant } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React from 'react';

import { IMetrics, IPanelOptions } from '../../utils/interfaces';
import { IPluginInstance, ITimes, PluginPanel } from '@kobsio/shared';
import Actions from './Actions';
import ChartSparkline from './ChartSparkline';
import ChartTimeseriesWrapper from './ChartTimeseriesWrapper';

interface IPanelChartProps {
  instance: IPluginInstance;
  title: string;
  description?: string;
  times: ITimes;
  options: IPanelOptions;
}

export const PanelChart: React.FunctionComponent<IPanelChartProps> = ({
  instance,
  title,
  description,
  times,
  options,
}: IPanelChartProps) => {
  const { isError, isFetching, error, data, refetch } = useQuery<IMetrics, Error>(
    ['prometheus/metrics', instance, options.queries, times],
    async () => {
      try {
        if (!options.queries || !Array.isArray(options.queries) || options.queries.length === 0) {
          throw new Error('Queries are missing');
        }

        const response = await fetch(`/api/plugins/prometheus/metrics`, {
          body: JSON.stringify({
            queries: options.queries,
            resolution: '',
            timeEnd: times.timeEnd,
            timeStart: times.timeStart,
          }),
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-plugin': instance.name,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-satellite': instance.satellite,
          },
          method: 'post',
        });
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          if ((json as IMetrics).metrics) {
            for (let i = 0; i < json.metrics.length; i++) {
              for (let j = 0; j < json.metrics[i].data.length; j++) {
                json.metrics[i].data[j] = {
                  x: new Date(json.metrics[i].data[j].x),
                  y: json.metrics[i].data[j].y,
                };
              }
            }
            return json;
          } else {
            return json;
          }
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
    { keepPreviousData: true },
  );

  return (
    <PluginPanel
      title={title}
      description={description}
      actions={<Actions instance={instance} isFetching={isFetching} times={times} queries={options.queries} />}
    >
      {isError ? (
        <Alert
          variant={AlertVariant.danger}
          isInline={true}
          title="Could not get metrics"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<IMetrics, Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      ) : data && data.metrics && data.metrics.length > 0 ? (
        <React.Fragment>
          {options.type === 'sparkline' && options.queries ? (
            <ChartSparkline
              queries={options.queries}
              metrics={data.metrics}
              unit={options.unit}
              mappings={options.mappings}
              times={times}
            />
          ) : options.type === 'line' || options.type === 'area' || options.type === 'bar' ? (
            <ChartTimeseriesWrapper
              metrics={data.metrics}
              type={options.type}
              stacked={options.stacked || false}
              unit={options.unit}
              min={options.yAxis?.min}
              max={options.yAxis?.max}
              legend={options.legend}
              times={times}
            />
          ) : null}
        </React.Fragment>
      ) : null}
    </PluginPanel>
  );
};

export default PanelChart;
