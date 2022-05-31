import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { IOptions, ISeries } from '../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';
import PageChart from './PageChart';
import { convertMetrics } from '../../utils/helpers';

interface IPageChartWrapperProps extends IOptions {
  instance: IPluginInstance;
}

// The PageChartWrapper component is used as a wrapper for the PageChart component. The component is responsible for
// loading the metrics for the users entered queries and time range. For that we have to refetch the metrics everytime
// the queries, time range or resolution is changed.
const PageChartWrapper: React.FunctionComponent<IPageChartWrapperProps> = ({
  instance,
  queries,
  resolution,
  times,
}: IPageChartWrapperProps) => {
  const navigate = useNavigate();

  const { isError, isLoading, error, data, refetch } = useQuery<ISeries, Error>(
    ['prometheus/metrics', instance, queries, resolution, times],
    async () => {
      try {
        const response = await fetch(`/api/plugins/prometheus/metrics`, {
          body: JSON.stringify({
            queries: queries.map((query) => {
              return { label: '', query: query };
            }),
            resolution: resolution,
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
        title="Could not get metrics"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): void => navigate('/')}>Home</AlertActionLink>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<ISeries, Error>> => refetch()}>
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

  return <PageChart queries={queries} series={data} />;
};

export default PageChartWrapper;
