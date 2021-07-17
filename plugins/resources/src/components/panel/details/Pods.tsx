import { Card, Flex, FlexItem } from '@patternfly/react-core';
import { IRow, Table, TableBody, TableHeader } from '@patternfly/react-table';
import React, { useContext } from 'react';
import { useQuery } from 'react-query';

import { ClustersContext, IClusterContext, emptyState } from '@kobsio/plugin-core';

interface IPodsProps {
  cluster: string;
  namespace: string;
  paramName: string;
  param: string;
}

// Pods is the pods tab for various resources. It can be used to show the pods for a deployment, statefulset,
// etc. within the tabs.
const Pods: React.FunctionComponent<IPodsProps> = ({ cluster, namespace, paramName, param }: IPodsProps) => {
  const clustersContext = useContext<IClusterContext>(ClustersContext);

  const { isError, isLoading, error, data } = useQuery<IRow[], Error>(
    ['resources/pods', cluster, namespace, paramName, param],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/resources/resources?cluster=${cluster}&namespace${namespace}&resource=pods&path=/api/v1&paramName=${paramName}&param=${param}`,
          { method: 'get' },
        );
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          if (clustersContext.resources && clustersContext.resources.hasOwnProperty('pods')) {
            return clustersContext.resources.pods.rows(json);
          }
        }

        if (json.error) {
          throw new Error(json.error);
        } else {
          throw new Error('An unknown error occured');
        }
      } catch (err) {
        throw err;
      }
    },
  );

  return (
    <Card>
      <Flex direction={{ default: 'column' }}>
        <FlexItem>
          <Table
            aria-label="pods"
            variant="compact"
            borders={false}
            isStickyHeader={false}
            cells={clustersContext.resources?.pods.columns}
            rows={
              data && data.length > 0
                ? data
                : emptyState(clustersContext.resources?.pods.columns.length || 3, isLoading, isError, error)
            }
          >
            <TableHeader />
            <TableBody />
          </Table>
        </FlexItem>
      </Flex>
    </Card>
  );
};

export default Pods;
