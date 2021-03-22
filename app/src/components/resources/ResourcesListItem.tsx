import { IRow, Table, TableBody, TableHeader } from '@patternfly/react-table';
import React, { useCallback, useEffect, useState } from 'react';

import { ClustersPromiseClient, GetResourcesRequest, GetResourcesResponse } from 'proto/clusters_grpc_web_pb';
import { IResource, emptyState } from 'utils/resources';
import { apiURL } from 'utils/constants';

// clustersService is the Clusters gRPC service, which is used to get a list of resources.
const clustersService = new ClustersPromiseClient(apiURL, null, null);

interface IResourcesListItemProps {
  clusters: string[];
  namespaces: string[];
  resource: IResource;
  selector: string;
  selectResource: (resource: IRow) => void;
}

// ResourcesListItem is the table for a single resource. To get the resources the component needs a list of clusters,
// namespaces, a resource and an optional selector.
const ResourcesListItem: React.FunctionComponent<IResourcesListItemProps> = ({
  clusters,
  namespaces,
  resource,
  selector,
  selectResource,
}: IResourcesListItemProps) => {
  const [rows, setRows] = useState<IRow[]>(emptyState(resource.columns.length, ''));

  // fetchResources fetchs a list of resources for the given clusters, namespaces and an optional label selector.
  const fetchResources = useCallback(async () => {
    try {
      const getResourcesRequest = new GetResourcesRequest();
      getResourcesRequest.setClustersList(clusters);
      getResourcesRequest.setPath(resource.isCRD ? `apis/${resource.path}` : resource.path);
      getResourcesRequest.setResource(resource.resource);

      if (resource.scope === 'Namespaced') {
        getResourcesRequest.setNamespacesList(namespaces);
      }

      if (selector) {
        getResourcesRequest.setParamname('labelSelector');
        getResourcesRequest.setParam(selector);
      }

      const getResourcesResponse: GetResourcesResponse = await clustersService.getResources(getResourcesRequest, null);
      const tmpRows = resource.rows(getResourcesResponse.getResourcesList());

      if (tmpRows.length > 0) {
        setRows(tmpRows);
      } else {
        setRows(emptyState(resource.columns.length, ''));
      }
    } catch (err) {
      setRows(emptyState(resource.columns.length, err.message));
    }
  }, [clusters, namespaces, resource, selector]);

  // useEffect is used to call the fetchResources function, every time the props of the component are changed.
  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  return (
    <Table
      aria-label={resource.title}
      variant="compact"
      borders={false}
      isStickyHeader={true}
      cells={resource.columns}
      rows={rows}
    >
      <TableHeader />
      <TableBody onRowClick={(e, row, props, data): void => selectResource(row)} />
    </Table>
  );
};

export default ResourcesListItem;
