import { IRow, Table, TableBody, TableHeader } from '@patternfly/react-table';
import React, { useCallback, useEffect, useMemo, useState } from 'react';

import { GetResourcesRequest, GetResourcesResponse } from 'generated/proto/clusters_pb';
import { emptyState, resources } from 'components/resources/shared/helpers';
import { ClustersPromiseClient } from 'generated/proto/clusters_grpc_web_pb';
import { apiURL } from 'utils/constants';

const clustersService = new ClustersPromiseClient(apiURL, null, null);

interface IResourceProps {
  cluster: string;
  namespace: string;
  kind: string;
  selector: string;
}

// Resource loads a list of resources for an application and shows them in a table. If the list of loaded recources is
// zero, we will display an empty state.
const Resource: React.FunctionComponent<IResourceProps> = ({ cluster, namespace, kind, selector }: IResourceProps) => {
  const columns = useMemo(
    () => (resources.hasOwnProperty(kind) ? resources[kind].columns : ['Name', 'Namespace', 'Cluster']),
    [kind],
  );
  const [rows, setRows] = useState<IRow[]>(emptyState(columns.length, ''));

  // fetchResources is used to get all resources from the gRPC API for an specific application. For that we have to set
  // the cluster, namespace and name of the application. Besides that the CR also defines the kind which should be
  // loaded and the labelSelector.
  const fetchResources = useCallback(async () => {
    try {
      const getResourcesRequest = new GetResourcesRequest();
      getResourcesRequest.setClustersList([cluster]);
      getResourcesRequest.setNamespacesList([namespace]);
      getResourcesRequest.setPath(resources[kind].path);
      getResourcesRequest.setResource(resources[kind].resource);
      getResourcesRequest.setParamname('labelSelector');
      getResourcesRequest.setParam(selector);

      const getResourcesResponse: GetResourcesResponse = await clustersService.getResources(getResourcesRequest, null);
      const tmpRows = resources[kind].rows(getResourcesResponse.getResourcesList());

      if (tmpRows.length > 0) {
        setRows(tmpRows);
      } else {
        setRows(emptyState(columns.length, ''));
      }
    } catch (err) {
      setRows(emptyState(columns.length, err.message));
    }
  }, [cluster, namespace, kind, selector, columns]);

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  return (
    <Table
      aria-label={resources[kind].title}
      variant="compact"
      borders={false}
      isStickyHeader={true}
      cells={columns}
      rows={rows}
    >
      <TableHeader />
      <TableBody />
    </Table>
  );
};

export default Resource;
