import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Drawer,
  DrawerContent,
  DrawerContentBody,
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

import { ITeam } from '@kobsio/plugin-core';
import TeamsItem from './TeamsItem';

export interface ITeamsProps {
  displayName: string;
  description: string;
}

// Teams is the page which is used to show all teams. The component will display the configured name and description of
// the teams plugin. Below this header it will display all the loaded teams.
const Teams: React.FunctionComponent<ITeamsProps> = ({ displayName, description }: ITeamsProps) => {
  const history = useHistory();

  const { isError, isLoading, error, data, refetch } = useQuery<ITeam[], Error>(['teams/teams'], async () => {
    try {
      const response = await fetch(`/api/plugins/teams/teams`, { method: 'get' });
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
  });

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          {displayName}
        </Title>
        <p>{description}</p>
      </PageSection>

      <Drawer isExpanded={false}>
        <DrawerContent panelContent={undefined}>
          <DrawerContentBody>
            <PageSection style={{ minHeight: '100%' }} variant={PageSectionVariants.default}>
              {isLoading ? (
                <div className="pf-u-text-align-center">
                  <Spinner />
                </div>
              ) : isError ? (
                <Alert
                  variant={AlertVariant.danger}
                  title="Could not get teams"
                  actionLinks={
                    <React.Fragment>
                      <AlertActionLink onClick={(): void => history.push('/')}>Home</AlertActionLink>
                      <AlertActionLink onClick={(): Promise<QueryObserverResult<ITeam[], Error>> => refetch()}>
                        Retry
                      </AlertActionLink>
                    </React.Fragment>
                  }
                >
                  <p>{error?.message}</p>
                </Alert>
              ) : data ? (
                <Gallery hasGutter={true}>
                  {data.map((team, index) => (
                    <GalleryItem key={index}>
                      <TeamsItem
                        cluster={team.cluster}
                        namespace={team.namespace}
                        name={team.name}
                        description={team.description}
                        logo={team.logo}
                      />
                    </GalleryItem>
                  ))}
                </Gallery>
              ) : null}
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default Teams;
