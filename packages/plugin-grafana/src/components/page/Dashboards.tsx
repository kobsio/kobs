import { Alert, AlertActionLink, AlertVariant, Card, DataList, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import DashboardsItem from './DashboardsItem';
import { IDashboard } from '../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';

interface IDashboardsProps {
  instance: IPluginInstance;
  query: string;
}

const Dashboards: React.FunctionComponent<IDashboardsProps> = ({ instance, query }: IDashboardsProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IDashboard[], Error>(
    ['grafana/dashboards', instance, query],
    async () => {
      try {
        const response = await fetch(`/api/plugins/grafana/dashboards?query=${encodeURIComponent(query)}`, {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-plugin': instance.name,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-satellite': instance.satellite,
          },
          method: 'get',
        });
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          return json;
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
        title="Could not get dashboards"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IDashboard[], Error>> => refetch()}>
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

  return (
    <Card>
      <DataList aria-label="dashboards list">
        {data
          .filter((dashboard) => dashboard.type !== 'dash-folder')
          .map((dashboard, index) => (
            <DashboardsItem key={dashboard.id} instance={instance} dashboard={dashboard} />
          ))}
      </DataList>
    </Card>
  );
};

export default Dashboards;
