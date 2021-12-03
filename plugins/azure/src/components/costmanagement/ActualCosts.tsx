import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { CostPieChart } from './CostPieChart';
import { IQueryResult } from './interfaces';

interface IActualCostsProps {
  name: string;
  timeframe: number;
}

const ActualCosts: React.FunctionComponent<IActualCostsProps> = ({ name, timeframe }: IActualCostsProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IQueryResult, Error>(
    ['azure/costmanagement/actualCost', name, timeframe],
    async () => {
      try {
        const timeframeParam = `timeframe=${timeframe}`;

        const response = await fetch(`/api/plugins/azure/${name}/costmanagement/actualCost?${timeframeParam}`, {
          method: 'get',
        });

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

  console.log(data);
  if (!data) {
    return null;
  }

  return (
    <div style={{ height: '500px' }}>
      <CostPieChart data={data} />
    </div>
  );
};

export default ActualCosts;
