import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Button,
  ButtonVariant,
  List,
  ListItem,
  ListVariant,
  PageSection,
  PageSectionVariants,
  Spinner,
} from '@patternfly/react-core';
import { Link, useHistory, useParams } from 'react-router-dom';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';
import { UsersIcon } from '@patternfly/react-icons';

import { ExternalLink, Title } from '@kobsio/plugin-core';
import { IApplication } from '../../utils/utils';

interface IApplicationsParams {
  cluster: string;
  namespace: string;
  name: string;
}

const Application: React.FunctionComponent = () => {
  const history = useHistory();
  const params = useParams<IApplicationsParams>();

  const { isError, isLoading, error, data, refetch } = useQuery<IApplication, Error>(
    ['applications/application', params.cluster, params.namespace, params.name],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/applications/application?cluster=${params.cluster}&namespace=${params.namespace}&name=${params.name}`,
          { method: 'get' },
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
            <AlertActionLink onClick={(): void => history.push('/applications')}>Applications</AlertActionLink>
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
      <PageSection variant={PageSectionVariants.light}>
        <Title title={data.name} subtitle={`${data.namespace} (${data.cluster})`} size="xl" />
        <div>
          <p>{data.description}</p>
          {(data.teams && data.teams.length > 0) || (data.links && data.links.length > 0) ? (
            <List variant={ListVariant.inline}>
              {data.teams &&
                data.teams.map((team, index) => (
                  <ListItem key={index}>
                    <Link
                      key={index}
                      to={`/teams/${team.cluster ? team.cluster : data.cluster}/${
                        team.namespace ? team.namespace : data.namespace
                      }/${team.name}`}
                    >
                      <Button variant={ButtonVariant.link} isInline={true} icon={<UsersIcon />}>
                        {team.name}
                      </Button>
                    </Link>
                  </ListItem>
                ))}

              {data.links &&
                data.links.map((link, index) => (
                  <ListItem key={index}>
                    <ExternalLink title={link.title} link={link.link} />
                  </ListItem>
                ))}
            </List>
          ) : null}
        </div>
      </PageSection>
      <PageSection variant={PageSectionVariants.default}>TODO</PageSection>
    </React.Fragment>
  );
};

export default Application;
