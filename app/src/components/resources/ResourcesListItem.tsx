import { IRow, Table, TableBody, TableHeader } from '@patternfly/react-table';
import React, { memo, useCallback, useEffect, useState } from 'react';

import { ClustersPromiseClient, GetResourcesRequest, GetResourcesResponse } from 'proto/clusters_grpc_web_pb';
import { IResource, emptyState } from 'utils/resources';
import { apiURL } from 'utils/constants';

// clustersService is the Clusters gRPC service, which is used to get a list of resources.
const clustersService = new ClustersPromiseClient(apiURL, null, null);

interface IDataState {
  error: string;
  isLoading: boolean;
  rows: IRow[];
}

interface IResourcesListItemProps {
  clusters: string[];
  namespaces: string[];
  resource: IResource;
  selector: string;
  selectResource?: (resource: IRow) => void;
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
  // const [rows, setRows] = useState<IRow[]>(emptyState(resource.columns.length, ''));
  const [data, setData] = useState<IDataState>({ error: '', isLoading: false, rows: [] });

  // fetchResources fetchs a list of resources for the given clusters, namespaces and an optional label selector.
  const fetchResources = useCallback(async () => {
    try {
      setData({ error: '', isLoading: true, rows: [] });
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
        setData({ error: '', isLoading: false, rows: tmpRows });
      } else {
        setData({ error: '', isLoading: false, rows: [] });
      }
    } catch (err) {
      setData({ error: err.message, isLoading: false, rows: [] });
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
      rows={
        data.rows.length > 0 && data.rows[0].cells?.length === resource.columns.length
          ? data.rows
          : emptyState(resource.columns.length, data.error, data.isLoading)
      }
    >
      <TableHeader />
      <TableBody
        onRowClick={
          selectResource && data.rows.length > 0 && data.rows[0].cells?.length === resource.columns.length
            ? (e, row, props, data): void => selectResource(row)
            : undefined
        }
      />
    </Table>
  );
};

export default memo(ResourcesListItem, (prevProps, nextProps) => {
  if (
    JSON.stringify(prevProps.clusters) === JSON.stringify(nextProps.clusters) &&
    JSON.stringify(prevProps.namespaces) === JSON.stringify(nextProps.namespaces) &&
    JSON.stringify(prevProps.resource) === JSON.stringify(nextProps.resource) &&
    prevProps.selector === nextProps.selector
  ) {
    return true;
  }

  return false;
});
