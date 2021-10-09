import { Alert, AlertActionLink, AlertVariant, Gallery, GalleryItem, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { IUser } from '../../utils/interfaces';
import UsersItem from '../page/UsersItem';

interface IUsersProps {
  cluster: string;
  namespace: string;
  name: string;
}

// The Users component is used to load all users for the specified team.
const Users: React.FunctionComponent<IUsersProps> = ({ cluster, namespace, name }: IUsersProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IUser[], Error>(
    ['users/team', cluster, namespace, name],
    async () => {
      try {
        const response = await fetch(`/api/plugins/users/team?cluster=${cluster}&namespace=${namespace}&name=${name}`, {
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
        title="Could not get users"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IUser[], Error>> => refetch()}>
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
    <Gallery hasGutter={true}>
      {data.map((user, index) => (
        <GalleryItem key={index}>
          <UsersItem
            cluster={user.cluster}
            namespace={user.namespace}
            name={user.name}
            fullName={user.fullName}
            email={user.email}
            position={user.position}
          />
        </GalleryItem>
      ))}
    </Gallery>
  );
};

export default Users;
