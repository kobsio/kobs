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

import { IPluginPageProps, useDebounce } from '@kobsio/plugin-core';
import { ITeam } from '../../utils/interfaces';
import TeamsItem from '../page/TeamsItem';

const Home: React.FunctionComponent<IPluginPageProps> = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

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
        title="Could not get teams"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<ITeam[], Error>> => refetch()}>
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
        <Toolbar id="applications-toolbar">
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
          .filter((team) =>
            !debouncedSearchTerm
              ? true
              : team.cluster.includes(debouncedSearchTerm) ||
                team.namespace.includes(debouncedSearchTerm) ||
                team.name.includes(debouncedSearchTerm) ||
                team.description?.includes(debouncedSearchTerm),
          )
          .map((team, index) => (
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
    </React.Fragment>
  );
};

export default Home;
