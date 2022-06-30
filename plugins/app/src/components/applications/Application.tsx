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
import { useNavigate, useParams } from 'react-router-dom';

import { PageContentSection, PageHeaderSection } from '@kobsio/shared';
import ApplicationDetailsLabels from './ApplicationDetailsLabels';
import { DashboardsWrapper } from '../dashboards/DashboardsWrapper';
import { IApplication } from '../../crds/application';

interface IApplicationParams extends Record<string, string | undefined> {
  satellite?: string;
  cluster?: string;
  namespace?: string;
  name?: string;
}

const Application: React.FunctionComponent = () => {
  const navigate = useNavigate();
  const params = useParams<IApplicationParams>();
  const [details, setDetails] = useState<React.ReactNode>(undefined);

  const { isError, isLoading, error, data, refetch } = useQuery<IApplication, Error>(
    ['app/applications/application', params.satellite, params.cluster, params.namespace, params.name],
    async () => {
      const response = await fetch(
        `/api/applications/application?id=${encodeURIComponent(
          `/satellite/${params.satellite}/cluster/${params.cluster}/namespace/${params.namespace}/name/${params.name}`,
        )}`,
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
        title="Could not get application"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): void => navigate('/')}>Home</AlertActionLink>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IApplication, Error>> => refetch()}>
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
                <Text component="h1">
                  {data.name}
                  <span className="pf-u-pl-sm pf-u-font-size-sm pf-u-color-400">
                    {data.topology && data.topology.external === true ? '' : `(${data.namespace} / ${data.cluster})`}
                  </span>
                </Text>
                {data.description ? <Text component="p">{data.description}</Text> : <Text component="p"></Text>}
              </TextContent>
            </FlexItem>

            <ApplicationDetailsLabels application={data} />
          </Flex>
        }
      />

      <PageContentSection hasPadding={false} hasDivider={false} toolbarContent={undefined} panelContent={details}>
        {data.dashboards ? (
          <DashboardsWrapper manifest={data} references={data.dashboards} setDetails={setDetails} />
        ) : (
          <div></div>
        )}
      </PageContentSection>
    </React.Fragment>
  );
};

export default Application;
