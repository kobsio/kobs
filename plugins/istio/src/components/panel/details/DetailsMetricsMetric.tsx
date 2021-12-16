import { Alert, AlertActionLink, AlertVariant, Card, CardBody, CardTitle, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { Chart, ISeries, convertMetrics } from '@kobsio/plugin-prometheus';
import { IPluginTimes } from '@kobsio/plugin-core';

interface IDetailsMetricsMetricProps {
  name: string;
  title: string;
  metric: 'sr' | 'rps' | 'latency';
  unit: string;
  reporter: 'destination' | 'source';
  destinationWorkload: string;
  destinationWorkloadNamespace: string;
  destinationVersion: string;
  destinationService: string;
  sourceWorkload: string;
  sourceWorkloadNamespace: string;
  pod: string;
  times: IPluginTimes;
}

const DetailsMetricsMetric: React.FunctionComponent<IDetailsMetricsMetricProps> = ({
  name,
  title,
  metric,
  unit,
  reporter,
  destinationWorkload,
  destinationWorkloadNamespace,
  destinationVersion,
  destinationService,
  sourceWorkload,
  sourceWorkloadNamespace,
  pod,
  times,
}: IDetailsMetricsMetricProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<ISeries, Error>(
    [
      'istio/metricsdetails',
      name,
      metric,
      reporter,
      destinationWorkload,
      destinationWorkloadNamespace,
      destinationVersion,
      destinationService,
      sourceWorkload,
      sourceWorkloadNamespace,
      pod,
      times,
    ],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/istio/${name}/metricsdetails?timeStart=${times.timeStart}&timeEnd=${times.timeEnd}&metric=${metric}&reporter=${reporter}&destinationWorkload=${destinationWorkload}&destinationWorkloadNamespace=${destinationWorkloadNamespace}&destinationVersion=${destinationVersion}&destinationService=${destinationService}&sourceWorkload=${sourceWorkload}&sourceWorkloadNamespace=${sourceWorkloadNamespace}&pod=${pod}`,
          {
            method: 'get',
          },
        );
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          if (json && json.metrics) {
            return convertMetrics(json.metrics, json.startTime, json.endTime, json.min, json.max);
          } else {
            return { endTime: times.timeEnd, labels: {}, max: 0, min: 0, series: [], startTime: times.timeStart };
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
                <AlertActionLink onClick={(): Promise<QueryObserverResult<ISeries, Error>> => refetch()}>
                  Retry
                </AlertActionLink>
              </React.Fragment>
            }
          >
            <p>{error?.message}</p>
          </Alert>
        ) : data ? (
          <div style={{ height: '300px' }}>
            <Chart
              startTime={data.startTime}
              endTime={data.endTime}
              min={data.min}
              max={data.max}
              options={{ stacked: false, type: 'line', unit: unit }}
              labels={data.labels}
              series={data.series}
            />
          </div>
        ) : null}
      </CardBody>
    </Card>
  );
};

export default DetailsMetricsMetric;
