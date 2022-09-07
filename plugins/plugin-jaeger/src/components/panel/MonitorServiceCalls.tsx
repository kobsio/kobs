import { Alert, AlertVariant, Spinner } from '@patternfly/react-core';
import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { IPluginInstance, ITimes, PluginPanel } from '@kobsio/shared';
import { IChartData } from '../../utils/interfaces';
import MonitorChart from './MonitorChart';
import { serviceMetricsToChartData } from '../../utils/helpers';

interface IMonitorServiceCallsProps {
  title: string;
  description?: string;
  instance: IPluginInstance;
  service: string;
  times: ITimes;
}

const MonitorServiceCalls: React.FunctionComponent<IMonitorServiceCallsProps> = ({
  title,
  description,
  instance,
  times,
  service,
}: IMonitorServiceCallsProps) => {
  const { isError, isLoading, error, data } = useQuery<IChartData[], Error>(
    ['jaeger/metrics/calls/service', instance, service, times],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/jaeger/metrics?metric=calls&service=${service}&groupByOperation=false&ratePer=600000&step=60000&timeStart=${times.timeStart}&timeEnd=${times.timeEnd}`,
          {
            headers: {
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'x-kobs-plugin': instance.name,
              // eslint-disable-next-line @typescript-eslint/naming-convention
              'x-kobs-satellite': instance.satellite,
            },
            method: 'get',
          },
        );
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          return serviceMetricsToChartData([{ metrics: json, name: 'Calls' }]);
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

  return (
    <PluginPanel title={title} description={description}>
      {isLoading ? (
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      ) : isError ? (
        <Alert isInline={true} variant={AlertVariant.danger} title="Could not get metrics">
          <p>{error?.message}</p>
        </Alert>
      ) : (
        <MonitorChart data={data} unit="req/s" times={times} />
      )}
    </PluginPanel>
  );
};

export default MonitorServiceCalls;
