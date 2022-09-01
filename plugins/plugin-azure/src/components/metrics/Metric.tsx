import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React from 'react';

import { IPluginInstance, ITimes } from '@kobsio/shared';
import { IMetric } from '../../utils/interfaces';
import MetricChart from './MetricChart';
import { formatMetrics } from '../../utils/helpers';

interface IMetricProps {
  instance: IPluginInstance;
  resourceGroup: string;
  provider: string;
  metricNames: string;
  aggregationType: string;
  times: ITimes;
}

const Metric: React.FunctionComponent<IMetricProps> = ({
  instance,
  resourceGroup,
  provider,
  metricNames,
  aggregationType,
  times,
}: IMetricProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IMetric[], Error>(
    ['azure/monitor/metrics', instance, resourceGroup, provider, metricNames, aggregationType, times],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/azure/monitor/metrics?resourceGroup=${resourceGroup}&provider=${provider}&metricNames=${metricNames}&aggregationType=${aggregationType}&timeStart=${times.timeStart}&timeEnd=${times.timeEnd}`,
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
          if (json && Array.isArray(json) && json.length > 0) {
            return formatMetrics(json, aggregationType);
          } else {
            throw new Error('Invalid JSON data');
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

  if (!data || data.length === 0) {
    return null;
  }

  return <MetricChart aggregationType={aggregationType} metrics={data} times={times} />;
};

export default Metric;
