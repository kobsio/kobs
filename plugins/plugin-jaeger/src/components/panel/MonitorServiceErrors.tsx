import { Alert, AlertVariant, Spinner } from '@patternfly/react-core';
import React from 'react';
import { useQuery } from '@tanstack/react-query';

import { IPluginInstance, ITimes, PluginPanel } from '@kobsio/shared';
import { IChartData } from '../../utils/interfaces';
import MonitorChart from './MonitorChart';
import { serviceMetricsToChartData } from '../../utils/helpers';

interface IMonitorServiceErrorsProps {
  title: string;
  description?: string;
  instance: IPluginInstance;
  service: string;
  spanKinds: string[];
  times: ITimes;
}

const MonitorServiceErrors: React.FunctionComponent<IMonitorServiceErrorsProps> = ({
  title,
  description,
  instance,
  service,
  spanKinds,
  times,
}: IMonitorServiceErrorsProps) => {
  const { isError, isLoading, error, data } = useQuery<IChartData[], Error>(
    ['jaeger/metrics/errors/service', instance, service, spanKinds, times],
    async () => {
      try {
        const sk = spanKinds.map((spanKind) => `&spanKind=${spanKind}`);

        const response = await fetch(
          `/api/plugins/jaeger/metrics?metric=errors&service=${service}${
            sk.length > 0 ? sk.join('') : ''
          }&groupByOperation=false&ratePer=600000&step=60000&timeStart=${times.timeStart}&timeEnd=${times.timeEnd}`,
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
          return serviceMetricsToChartData([{ metrics: json, name: 'Errors' }]);
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
        <MonitorChart data={data} unit="%" times={times} />
      )}
    </PluginPanel>
  );
};

export default MonitorServiceErrors;
