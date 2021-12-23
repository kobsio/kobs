import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';
import { useHistory } from 'react-router-dom';

import { IOptions, ISeries } from '../../utils/interfaces';
import PageChart from './PageChart';
import { convertMetrics } from '../../utils/helpers';

interface IPageChartWrapperProps extends IOptions {
  name: string;
}

// The PageChartWrapper component is used as a wrapper for the PageChart component. The component is responsible for
// loading the metrics for the users entered queries and time range. For that we have to refetch the metrics everytime
// the queries, time range or resolution is changed.
const PageChartWrapper: React.FunctionComponent<IPageChartWrapperProps> = ({
  name,
  queries,
  resolution,
  times,
}: IPageChartWrapperProps) => {
  const history = useHistory();

  const { isError, isLoading, error, data, refetch } = useQuery<ISeries, Error>(
    ['prometheus/metrics', name, queries, resolution, times],
    async () => {
      try {
        const response = await fetch(`/api/plugins/prometheus/${name}/metrics`, {
          body: JSON.stringify({
            queries: queries.map((query) => {
              return { label: '', query: query };
            }),
            resolution: resolution,
            timeEnd: times.timeEnd,
            timeStart: times.timeStart,
          }),
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
            <AlertActionLink onClick={(): void => history.push('/')}>Home</AlertActionLink>
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
