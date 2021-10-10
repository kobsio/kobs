import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Card,
  Gallery,
  GalleryItem,
  Spinner,
  TextInput,
  Toolbar,
  ToolbarContent,
  ToolbarGroup,
  ToolbarItem,
} from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useState } from 'react';

import { IPluginPageProps, IUser, useDebounce } from '@kobsio/plugin-core';
import UsersItem from '../page/UsersItem';

const Home: React.FunctionComponent<IPluginPageProps> = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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
    <React.Fragment>
      <Card>
        <Toolbar id="users-toolbar">
          <ToolbarContent>
            <ToolbarGroup style={{ alignItems: 'flex-start', width: '100%' }}>
              <ToolbarItem style={{ width: '100%' }}>
                <TextInput
                  aria-label="Search"
                  placeholder="Search"
                  type="text"
                  value={searchTerm}
                  onChange={setSearchTerm}
                />
              </ToolbarItem>
            </ToolbarGroup>
          </ToolbarContent>
        </Toolbar>
      </Card>

      <p>&nbsp;</p>

      <Gallery hasGutter={true}>
        {data
          .filter((user) =>
            !debouncedSearchTerm
              ? true
              : user.cluster.includes(debouncedSearchTerm) ||
                user.namespace.includes(debouncedSearchTerm) ||
                user.name.includes(debouncedSearchTerm) ||
                user.fullName.includes(debouncedSearchTerm) ||
                user.email.includes(debouncedSearchTerm) ||
                user.position?.includes(debouncedSearchTerm),
          )
          .map((user, index) => (
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
    </React.Fragment>
  );
};

export default Home;
