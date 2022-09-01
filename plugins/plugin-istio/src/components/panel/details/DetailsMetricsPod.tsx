import { Alert, AlertActionLink, AlertVariant, Card, CardBody, CardTitle, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React from 'react';

import { IPluginInstance, ITimes } from '@kobsio/shared';
import Chart from '../../../utils/prometheus/Chart';
import { IMetrics } from '../../../utils/prometheus/interfaces';

interface IDetailsMetricsPodProps {
  instance: IPluginInstance;
  title: string;
  metric: 'cpu' | 'throttling' | 'memory';
  unit: string;
  namespace: string;
  pod: string;
  times: ITimes;
}

const DetailsMetricsPod: React.FunctionComponent<IDetailsMetricsPodProps> = ({
  instance,
  title,
  metric,
  unit,
  namespace,
  pod,
  times,
}: IDetailsMetricsPodProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IMetrics, Error>(
    ['istio/metricspod', instance, metric, namespace, pod, times],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/istio/metricspod?timeStart=${times.timeStart}&timeEnd=${times.timeEnd}&metric=${metric}&namespace=${namespace}&pod=${pod}`,
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
  );

  return (
    <Card isCompact={true}>
      <CardTitle>{title}</CardTitle>
      <CardBody>
        {isLoading ? (
          <div className="pf-u-text-align-center">
            <Spinner />
          </div>
        ) : isError ? (
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
        ) : data && data.metrics ? (
          <div style={{ height: '300px' }}>
            <Chart metrics={data.metrics} unit={unit} times={times} />
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
};

export default DetailsMetricsPod;
