import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { CostPieChart } from './CostPieChart';
import { IPluginTimes } from '@kobsio/plugin-core';
import { IQueryResult } from './interfaces';

interface IActualCostsProps {
  name: string;
  scope: string;
  times: IPluginTimes;
}

const ActualCosts: React.FunctionComponent<IActualCostsProps> = ({ name, scope, times }: IActualCostsProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IQueryResult, Error>(
    ['azure/costmanagement/actualcost', name, scope, times],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/azure/${name}/costmanagement/actualcosts?scope=${scope}&timeStart=${times.timeStart}&timeEnd=${times.timeEnd}`,
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
            throw new Error('An unknown error occurred');
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
        title="Could not get costs"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IQueryResult, Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data || !data.properties || data.properties.rows.length === 0) {
    return (
      <Alert
        variant={AlertVariant.warning}
        isInline={true}
        title="No cost data found"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IQueryResult, Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>For the selected scope or time range was no cost data found.</p>
      </Alert>
    );
  }

  return (
    <div style={{ height: '100%' }}>
      <CostPieChart data={data} />;
    </div>
  );
};

export default ActualCosts;
