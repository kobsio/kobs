import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React from 'react';

import { IPluginInstance, ITimes } from '@kobsio/shared';
import { CostPieChart } from './CostPieChart';
import CostPieChartLegend from './CostPieChartLegend';
import { IQueryResult } from './interfaces';

interface IActualCostsProps {
  instance: IPluginInstance;
  scope: string;
  times: ITimes;
}

const ActualCosts: React.FunctionComponent<IActualCostsProps> = ({ instance, scope, times }: IActualCostsProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IQueryResult, Error>(
    ['azure/costmanagement/actualcost', instance, scope, times],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/azure/costmanagement/actualcosts?scope=${scope}&timeStart=${times.timeStart}&timeEnd=${times.timeEnd}`,
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
      <div style={{ height: '75%' }}>
        <CostPieChart data={data} />
      </div>
      <div style={{ height: '25%', overflowX: 'scroll' }}>
        <CostPieChartLegend data={data} />
      </div>
    </div>
  );
};

export default ActualCosts;
