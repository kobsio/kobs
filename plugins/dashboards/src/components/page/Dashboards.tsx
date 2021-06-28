import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Gallery,
  GalleryItem,
  PageSection,
  PageSectionVariants,
  Spinner,
  Title,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';
import { useHistory } from 'react-router-dom';

import DashboardsItem from './DashboardsItem';
import { IDashboard } from '../../utils/interfaces';

export interface IDashboardsProps {
  displayName: string;
  description: string;
}

const Dashboards: React.FunctionComponent<IDashboardsProps> = ({ displayName, description }: IDashboardsProps) => {
  const history = useHistory();

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
      </PageSection>

      <PageSection style={{ height: '100%', minHeight: '100%' }} variant={PageSectionVariants.default}>
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
          <Gallery hasGutter={true} maxWidths={{ default: '100%' }}>
            {data.map((dashboard, index) => (
              <GalleryItem key={index}>
                <DashboardsItem dashboard={dashboard} />
              </GalleryItem>
            ))}
          </Gallery>
        ) : null}
      </PageSection>
    </React.Fragment>
  );
};

export default Dashboards;
