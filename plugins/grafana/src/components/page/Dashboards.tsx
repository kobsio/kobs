import { Alert, AlertActionLink, AlertVariant, Menu, MenuContent, MenuList, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import DashboardsItem from './DashboardsItem';
import { IDashboard } from '../../utils/interfaces';

interface IDashboardsProps {
  name: string;
  query: string;
  publicAddress: string;
}

const Dashboards: React.FunctionComponent<IDashboardsProps> = ({ name, query, publicAddress }: IDashboardsProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IDashboard[], Error>(
    ['grafana/dashboards', name, query],
    async () => {
      try {
        const response = await fetch(`/api/plugins/grafana/${name}/dashboards?query=${encodeURIComponent(query)}`, {
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
    <Menu>
      <MenuContent>
        <MenuList>
          {data
            .filter((dashboard) => dashboard.type !== 'dash-folder')
            .map((dashboard, index) => (
              <DashboardsItem key={dashboard.id} dashboard={dashboard} publicAddress={publicAddress} />
            ))}
        </MenuList>
      </MenuContent>
    </Menu>
  );
};

export default Dashboards;
