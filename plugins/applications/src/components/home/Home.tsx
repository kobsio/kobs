import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Badge,
  Card,
  CardBody,
  CardTitle,
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
import React, { useContext, useState } from 'react';

import {
  ClustersContext,
  IApplication,
  IClusterContext,
  IPluginPageProps,
  LinkWrapper,
  useDebounce,
} from '@kobsio/plugin-core';

const Home: React.FunctionComponent<IPluginPageProps> = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearchTerm = useDebounce(searchTerm, 500);
  const clustersContext = useContext<IClusterContext>(ClustersContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IApplication[], Error>(
    ['applications/applications', 'gallery', clustersContext.clusters],
    async () => {
      try {
        const clusterParams = clustersContext.clusters.map((cluster) => `cluster=${cluster}`).join('&');

        const response = await fetch(`/api/plugins/applications/applications?view=gallery&${clusterParams}`, {
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
        title="Could not get applications"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IApplication[], Error>> => refetch()}>
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
          .filter((application) =>
            !debouncedSearchTerm
              ? true
              : application.cluster.includes(debouncedSearchTerm) ||
                application.namespace.includes(debouncedSearchTerm) ||
                application.name.includes(debouncedSearchTerm) ||
                application.description?.includes(debouncedSearchTerm),
          )
          .map((application, index) => (
            <GalleryItem key={index}>
              <LinkWrapper link={`/applications/${application.cluster}/${application.namespace}/${application.name}`}>
                <Card style={{ cursor: 'pointer' }} isHoverable={true}>
                  <CardTitle className="pf-u-text-truncate">
                    {application.name}
                    <br />
                    <span className="pf-u-font-size-sm pf-u-color-400">
                      {application.topology?.external
                        ? 'external'
                        : `${application.namespace} (${application.cluster})`}
                    </span>
                  </CardTitle>
                  <CardBody style={{ height: '150px', maxHeight: '150px', minHeight: '150px' }}>
                    <div className="kobsio-hide-scrollbar" style={{ height: '124px', overflow: 'auto' }}>
                      {application.tags && (
                        <p>
                          {application.tags.map((tag) => (
                            <Badge key={tag} className="pf-u-mr-sm">
                              {tag.toLowerCase()}
                            </Badge>
                          ))}
                        </p>
                      )}
                      {application.description && <p>{application.description}</p>}
                    </div>
                  </CardBody>
                </Card>
              </LinkWrapper>
            </GalleryItem>
          ))}
      </Gallery>
    </React.Fragment>
  );
};

export default Home;
