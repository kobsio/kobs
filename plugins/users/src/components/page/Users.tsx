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

import { IUser } from '@kobsio/plugin-core';
import UsersItem from './UsersItem';

export interface IUsersProps {
  displayName: string;
  description: string;
}

// Users is the page which is used to show all user. The component will display the configured name and description of
// the users plugin. Below this header it will display all the loaded users.
const Users: React.FunctionComponent<IUsersProps> = ({ displayName, description }: IUsersProps) => {
  const history = useHistory();

  const { isError, isLoading, error, data, refetch } = useQuery<IUser[], Error>(['users/users'], async () => {
    try {
      const response = await fetch(`/api/plugins/users/users`, { method: 'get' });
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
                  title="Could not get users"
                  actionLinks={
                    <React.Fragment>
                      <AlertActionLink onClick={(): void => history.push('/')}>Home</AlertActionLink>
                      <AlertActionLink onClick={(): Promise<QueryObserverResult<IUser[], Error>> => refetch()}>
                        Retry
                      </AlertActionLink>
                    </React.Fragment>
                  }
                >
                  <p>{error?.message}</p>
                </Alert>
              ) : data ? (
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
              ) : null}
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default Users;
