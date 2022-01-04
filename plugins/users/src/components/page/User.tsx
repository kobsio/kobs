import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Avatar,
  Card,
  CardBody,
  PageSection,
  PageSectionVariants,
  Spinner,
  TextContent,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import { useHistory, useParams } from 'react-router-dom';
import React from 'react';
import ReactMarkdown from 'react-markdown';

import { IUser, getGravatarImageUrl } from '@kobsio/plugin-core';
import Teams from './Teams';

interface IUserParams {
  cluster: string;
  namespace: string;
  name: string;
}

// User is the component for the users page. It loads a user by the specified cluster, namespace and name URL
// parameter. Everytime the cluster, namespace or name parameter is changed we make an API call to get the user.
const User: React.FunctionComponent = () => {
  const history = useHistory();
  const params = useParams<IUserParams>();

  const { isError, isLoading, error, data, refetch } = useQuery<IUser, Error>(
    ['users/user', params.cluster, params.namespace, params.name],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/users/user?cluster=${params.cluster}&namespace=${params.namespace}&name=${params.name}`,
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

  // During the API call we are showing a spinner, to show the user that the user is currently loading.
  if (isLoading) {
    return <Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />;
  }

  // When an error occures during the API call, we show the user this error. The user can then go back to the home page,
  // to the users page or he can retry the API call.
  if (isError) {
    return (
      <Alert
        style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }}
        variant={AlertVariant.danger}
        title="Could not get user"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): void => history.push('/')}>Home</AlertActionLink>
            <AlertActionLink onClick={(): void => history.push('/users')}>Users</AlertActionLink>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IUser, Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  // When the data is undefined and the isLoading and isError variables are not true we show nothing. This happens while
  // the component is rendered the first time.
  if (!data) {
    return null;
  }

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.default}>
        <Card isCompact={true}>
          <CardBody>
            <div className="pf-u-text-align-center">
              <Avatar
                src={getGravatarImageUrl(data.profile.email, 64)}
                alt={data.profile.fullName}
                style={{ height: '64px', width: '64px' }}
              />
              <div className="pf-c-title pf-m-xl">{data.profile.fullName}</div>
              {data.profile.position && <div className="pf-u-font-size-md pf-u-color-400">{data.profile.position}</div>}
            </div>
          </CardBody>
        </Card>
      </PageSection>

      {data.teams && data.teams.length > 0 && <Teams teams={data.teams} />}

      {data.profile?.bio && (
        <PageSection variant={PageSectionVariants.default}>
          <Card isCompact={true}>
            <CardBody>
              <TextContent>
                <ReactMarkdown linkTarget="_blank">{data.profile.bio}</ReactMarkdown>
              </TextContent>
            </CardBody>
          </Card>
        </PageSection>
      )}
    </React.Fragment>
  );
};

export default User;
