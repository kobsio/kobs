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

import { GetResourcesRequest, GetResourcesResponse } from '../../generated/proto/clusters_pb';
import { emptyState, resources } from './helpers';
import { ClustersPromiseClient } from '../../generated/proto/clusters_grpc_web_pb';
import Filter from './Filter';
import Resource from './Resource';
import { apiURL } from '../../utils/constants';

const clustersService = new ClustersPromiseClient(apiURL, null, null);

interface ResourcesParams {
  kind: string;
}

const Resources: React.FunctionComponent = () => {
  const history = useHistory();
  const params = useParams<ResourcesParams>();

  const columns = resources.hasOwnProperty(params.kind)
    ? resources[params.kind].columns
    : ['Name', 'Namespace', 'Cluster'];
  const [rows, setRows] = useState<IRow[]>(emptyState(columns.length, ''));
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [selectedResource, setSelectedResource] = useState<IRow | undefined>(undefined);

  const goToOverview = (): void => {
    history.push('/');
  };

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
        <p className="pf-u-mb-xl">{resources[params.kind].description}</p>
        <Filter isLoading={isLoading} onFilter={fetchResources} />
      </PageSection>

      <Drawer isExpanded={selectedResource !== undefined}>
        <DrawerContent
          panelContent={
            selectedResource ? (
              <Resource
                resource={selectedResource}
                columns={columns}
                close={(): void => setSelectedResource(undefined)}
              />
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
