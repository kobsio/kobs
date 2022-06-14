import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Flex,
  FlexItem,
  Spinner,
  Text,
  TextContent,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';

import { PageContentSection, PageHeaderSection } from '@kobsio/shared';
import Dashboard from './Dashboard';
import { IDashboard } from '../../crds/dashboard';

interface IDashboardPageParams extends Record<string, string | undefined> {
  satellite?: string;
  cluster?: string;
  namespace?: string;
  name?: string;
}

const DashboardPage: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const params = useParams<IDashboardPageParams>();
  const [details, setDetails] = useState<React.ReactNode>(undefined);

  const { isError, isLoading, error, data, refetch } = useQuery<IDashboard, Error>(
    ['app/dashboards/dashboard', params.satellite, params.cluster, params.namespace, params.name, location.search],
    async () => {
      const response = await fetch(
        `/api/dashboards/dashboard?id=${encodeURIComponent(
          `/satellite/${params.satellite}/cluster/${params.cluster}/namespace/${params.namespace}/name/${params.name}`,
        )}${location.search.substring(1)}`,
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
          throw new Error('An unknown error occured');
        }
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
        title="Could not get dashboard"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): void => navigate('/')}>Home</AlertActionLink>
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
      <PageHeaderSection
        component={
          <Flex direction={{ default: 'column' }}>
            <FlexItem>
              <TextContent>
                <Text component="h1">{data.title}</Text>
                {data.description ? <Text component="p">{data.description}</Text> : <Text component="p"></Text>}
              </TextContent>
            </FlexItem>
          </Flex>
        }
      />

      <PageContentSection hasPadding={true} toolbarContent={undefined} panelContent={details}>
        <Dashboard dashboard={data} forceDefaultSpan={false} setDetails={setDetails} />
      </PageContentSection>
    </React.Fragment>
  );
};

export default DashboardPage;
