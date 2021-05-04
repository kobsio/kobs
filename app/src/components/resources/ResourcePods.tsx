import { Card, Flex, FlexItem } from '@patternfly/react-core';
import { IRow, Table, TableBody, TableHeader } from '@patternfly/react-table';
import React, { useCallback, useEffect, useState } from 'react';

import { ClustersPromiseClient, GetResourcesRequest, GetResourcesResponse } from 'proto/clusters_grpc_web_pb';
import { emptyState, resources } from 'utils/resources';
import { apiURL } from 'utils/constants';

// clustersService is the Clusters gRPC service, which is used to get a list of pods.
const clustersService = new ClustersPromiseClient(apiURL, null, null);

interface IResourcePodsProps {
  cluster: string;
  namespace: string;
  selector: string;
}

// ResourcePods is the pods tab for various resources. It can be used to show the pods for a deployment, statefulset,
// etc. within the tabs.
const ResourcePods: React.FunctionComponent<IResourcePodsProps> = ({
  cluster,
  namespace,
  selector,
}: IResourcePodsProps) => {
  const [pods, setPods] = useState<IRow[]>(emptyState(resources.pods.columns.length, '', false));

  // fetchPods fetches the pods for the given cluster, namespace and label selector.
  const fetchPods = useCallback(async () => {
    try {
      const getResourcesRequest = new GetResourcesRequest();
      getResourcesRequest.setClustersList([cluster]);
      getResourcesRequest.setNamespacesList([namespace]);
      getResourcesRequest.setPath(resources.pods.path);
      getResourcesRequest.setResource(resources.pods.resource);
      getResourcesRequest.setParamname('labelSelector');
      getResourcesRequest.setParam(selector);

      const getResourcesResponse: GetResourcesResponse = await clustersService.getResources(getResourcesRequest, null);
      const resourceList = getResourcesResponse.getResourcesList();

      if (resourceList.length === 1) {
        setPods(resources.pods.rows(resourceList));
      } else {
        setPods(emptyState(resources.pods.columns.length, '', false));
      }
    } catch (err) {
      setPods(emptyState(resources.pods.columns.length, err.message, false));
    }
  }, [cluster, namespace, selector]);

  useEffect(() => {
    fetchPods();
  }, [fetchPods]);

  return (
    <Card>
      <Flex direction={{ default: 'column' }}>
        <FlexItem>
          <Table
            aria-label="pods"
            variant="compact"
            borders={false}
            isStickyHeader={false}
            cells={resources.pods.columns}
            rows={pods}
          >
            <TableHeader />
            <TableBody />
          </Table>
        </FlexItem>
      </Flex>
    </Card>
  );
};

export default ResourcePods;
