import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Menu,
  MenuContent,
  MenuList,
  PageSection,
  PageSectionVariants,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';

import { IDashboard, useDebounce } from '@kobsio/plugin-core';
import DashboardsItem from './DashboardsItem';
import DashboardsModal from './DashboardsModal';
import DashboardsToolbar from './DashboardsToolbar';
import { filterDashboards } from '../../utils/dashboard';

export interface IDashboardsProps {
  displayName: string;
  description: string;
}

const Dashboards: React.FunctionComponent<IDashboardsProps> = ({ displayName, description }: IDashboardsProps) => {
  const history = useHistory();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const [dashboard, setDashboard] = useState<IDashboard | undefined>(undefined);

  const { isError, isLoading, error, data, refetch } = useQuery<IDashboard[], Error>(
    ['dashboards/dashboards'],
    async () => {
      try {
        const response = await fetch(`/api/plugins/dashboards/dashboards`, { method: 'get' });
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

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          {displayName}
        </Title>
        <p>{description}</p>
        <DashboardsToolbar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      </PageSection>

      <DashboardsModal dashboard={dashboard} setDashboard={setDashboard} />

      <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
        {isLoading ? (
          <div className="pf-u-text-align-center">
            <Spinner />
          </div>
        ) : isError ? (
          <Alert
            variant={AlertVariant.danger}
            title="Could not get dashboards"
            actionLinks={
              <React.Fragment>
                <AlertActionLink onClick={(): void => history.push('/')}>Home</AlertActionLink>
                <AlertActionLink onClick={(): Promise<QueryObserverResult<IDashboard[], Error>> => refetch()}>
                  Retry
                </AlertActionLink>
              </React.Fragment>
            }
          >
            <p>{error?.message}</p>
          </Alert>
        ) : data ? (
          <Menu>
            <MenuContent>
              <MenuList>
                {filterDashboards(data, debouncedSearchTerm).map((dashboard) => (
                  <DashboardsItem
                    key={`${dashboard.cluster}-${dashboard.namespace}-${dashboard.name}`}
                    dashboard={dashboard}
                    setDashboard={setDashboard}
                  />
                ))}
              </MenuList>
            </MenuContent>
          </Menu>
        ) : null}
      </PageSection>
    </React.Fragment>
  );
};

export default Dashboards;
