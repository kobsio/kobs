import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Drawer,
  DrawerContent,
  DrawerContentBody,
  PageSection,
  PageSectionVariants,
  Title,
} from '@patternfly/react-core';
import { IRow, Table, TableBody, TableHeader } from '@patternfly/react-table';
import React, { useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { GetResourcesRequest, GetResourcesResponse } from 'generated/proto/clusters_pb';
import { emptyState, resources } from 'components/resources/shared/helpers';
import { ClustersPromiseClient } from 'generated/proto/clusters_grpc_web_pb';
import DrawerPanel from 'components/resources/drawer/DrawerPanel';
import Filter from 'components/resources/shared/Filter';
import { apiURL } from 'utils/constants';

const clustersService = new ClustersPromiseClient(apiURL, null, null);

interface IResourcesParams {
  kind: string;
}

// Resources is the page to display a table of resources for a list of clusters and namespaces. The resource is
// determined by the kind parameter from the URL. If the kind could not be found in the list of resources, we show the
// user an error. If the kind is valid the user can select a list of clusters and namespaces and gets a table with all
// matching resources as result.
// When the user selects a row with a resource a drawer for this resource is shown. The drawer contains the yaml
// manifest for this resource and a list of events.
const Resources: React.FunctionComponent = () => {
  const history = useHistory();
  const params = useParams<IResourcesParams>();

  const columns = resources.hasOwnProperty(params.kind)
    ? resources[params.kind].columns
    : ['Name', 'Namespace', 'Cluster'];
  const [rows, setRows] = useState<IRow[]>(emptyState(columns.length, ''));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedResource, setSelectedResource] = useState<IRow | undefined>(undefined);

  const goToOverview = (): void => {
    history.push('/');
  };

  // fetchResources is the function to fetch all resources for a list of clusters and namespaces. The function is passed
  // to the Filter component via the onFilter property. The returned items are converted into the IRow interface, which
  // is then displayed in the Table component.
  const fetchResources = async (clusters: string[], namespaces: string[]): Promise<void> => {
    try {
      if (clusters.length === 0 || namespaces.length === 0) {
        throw new Error('You must select a cluster and a namespace');
      } else {
        setIsLoading(true);

        const getResourcesRequest = new GetResourcesRequest();
        getResourcesRequest.setClustersList(clusters);
        getResourcesRequest.setNamespacesList(namespaces);
        getResourcesRequest.setPath(resources[params.kind].path);
        getResourcesRequest.setResource(resources[params.kind].resource);

        const getResourcesResponse: GetResourcesResponse = await clustersService.getResources(
          getResourcesRequest,
          null,
        );
        const tmpRows = resources[params.kind].rows(getResourcesResponse.getResourcesList());

        if (tmpRows.length > 0) {
          setRows(tmpRows);
        } else {
          setRows(emptyState(columns.length, ''));
        }

        setIsLoading(false);
      }
    } catch (err) {
      setRows(emptyState(columns.length, err.message));
      setIsLoading(false);
    }
  };

  // When the user doesn't provide a valid resource, we show an Alert. The alert contains a link to the overview page,
  // so that the user can select a valid resource. Maybe we can also display a list of the most resources or resources
  // which the user might have meant.
  if (!resources.hasOwnProperty(params.kind)) {
    return (
      <PageSection variant={PageSectionVariants.default}>
        <Alert
          variant={AlertVariant.danger}
          isInline={false}
          title="Invalid resource type"
          actionLinks={<AlertActionLink onClick={goToOverview}>Overview</AlertActionLink>}
        >
          <p>
            The given resource type <b>{params.kind}</b> is invalid.
          </p>
        </Alert>
      </PageSection>
    );
  }

  return (
    <React.Fragment>
      <PageSection variant={PageSectionVariants.light}>
        <Title headingLevel="h6" size="xl">
          {resources[params.kind].title}
        </Title>
        <p>{resources[params.kind].description}</p>
        <Filter isLoading={isLoading} onFilter={fetchResources} />
      </PageSection>

      <Drawer isExpanded={selectedResource !== undefined}>
        <DrawerContent
          panelContent={
            selectedResource ? (
              <DrawerPanel resource={selectedResource} close={(): void => setSelectedResource(undefined)} />
            ) : undefined
          }
        >
          <DrawerContentBody>
            <PageSection className="kobs-drawer-pagesection" variant={PageSectionVariants.default}>
              <Table
                aria-label={resources[params.kind].title}
                variant="compact"
                borders={false}
                isStickyHeader={true}
                cells={columns}
                rows={rows}
              >
                <TableHeader />
                <TableBody onRowClick={(e, row, props, data): void => setSelectedResource(row)} />
              </Table>
            </PageSection>
          </DrawerContentBody>
        </DrawerContent>
      </Drawer>
    </React.Fragment>
  );
};

export default Resources;
