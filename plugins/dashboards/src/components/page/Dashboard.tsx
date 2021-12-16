import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  PageSection,
  PageSectionVariants,
  Spinner,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useState } from 'react';
import { useHistory, useLocation, useParams } from 'react-router-dom';

import { IDashboard, Title } from '@kobsio/plugin-core';
import { getInitialDefaults, getPlaceholdersFromSearch } from '../../utils/dashboard';
import DashboardWrapper from '../dashboards/DashboardWrapper';

interface IDashboardParams {
  cluster: string;
  namespace: string;
  name: string;
}

const Dashboard: React.FunctionComponent = () => {
  const history = useHistory();
  const location = useLocation();
  const params = useParams<IDashboardParams>();
  const defaults = getInitialDefaults(location.search);
  const placeholders = getPlaceholdersFromSearch(location.search);
  const [details, setDetails] = useState<React.ReactNode>(undefined);

  const { isError, isLoading, error, data, refetch } = useQuery<IDashboard, Error>(
    ['dashboards/dashboard', params.cluster, params.namespace, params.name, placeholders],
    async () => {
      try {
        const response = await fetch(`/api/plugins/dashboards/dashboard`, {
          body: JSON.stringify({
            cluster: params.cluster,
            name: params.name,
            namespace: params.namespace,
            placeholders: placeholders,
          }),
          method: 'post',
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
    return <Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />;
  }

  if (isError) {
    return (
      <Alert
        style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }}
        variant={AlertVariant.danger}
        title="Could not get application"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): void => history.push('/')}>Home</AlertActionLink>
            <AlertActionLink onClick={(): void => history.push('/dashboards')}>Dashboards</AlertActionLink>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IDashboard, Error>> => refetch()}>
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

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title title={data.name} subtitle={`${data.namespace} (${data.cluster})`} size="xl" />
        <div>
          <p>{data.description}</p>
        </div>
      </PageSection>

      {data ? (
        <Drawer isExpanded={details !== undefined}>
          <DrawerContent panelContent={details}>
            <DrawerContentBody>
              <PageSection variant={PageSectionVariants.default} style={{ minHeight: '100%' }}>
                <DashboardWrapper defaults={defaults} dashboard={data} showDetails={setDetails} />
              </PageSection>
            </DrawerContentBody>
          </DrawerContent>
        </Drawer>
      ) : (
        <PageSection variant={PageSectionVariants.default}></PageSection>
      )}
    </React.Fragment>
  );
};

export default Dashboard;
