import { Card, Flex, FlexItem } from '@patternfly/react-core';
import React, { useContext } from 'react';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from 'react-query';

import { ClustersContext, IClusterContext, IResourceRow, emptyState } from '@kobsio/plugin-core';

interface IEventsProps {
  cluster: string;
  namespace: string;
  name: string;
}

// Events is the component to display the events for a resource. The resource is identified by the cluster, namespace
// and name. The event must contain the involvedObject.name=<NAME> to be listed for a resource.
const Events: React.FunctionComponent<IEventsProps> = ({ cluster, namespace, name }: IEventsProps) => {
  const clustersContext = useContext<IClusterContext>(ClustersContext);

  const { isError, isLoading, error, data } = useQuery<IResourceRow[], Error>(
    ['resources/events', cluster, namespace, name],
    async () => {
      try {
        const response = await fetch(
          `/api/plugins/resources/resources?cluster=${cluster}&namespace${namespace}&resource=events&path=/api/v1&paramName=fieldSelector&param=involvedObject.name=${name}`,
          { method: 'get' },
        );
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          if (clustersContext.resources && clustersContext.resources.hasOwnProperty('events')) {
            return clustersContext.resources.events.rows(json);
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
          <TableComposable aria-label="events" variant={TableVariant.compact} borders={false}>
            <Thead>
              <Tr>
                {clustersContext.resources?.events.columns.map((column) => (
                  <Th key={column}>{column}</Th>
                ))}
              </Tr>
            </Thead>
            <Tbody>
              {data && data.length > 0
                ? data.map((row, rowIndex) => (
                    <Tr key={rowIndex}>
                      {row.cells.map((cell, cellIndex) => (
                        <Td key={cellIndex}>{cell}</Td>
                      ))}
                    </Tr>
                  ))
                : emptyState(clustersContext.resources?.events.columns.length || 3, isLoading, isError, error)}
            </Tbody>
          </TableComposable>
        </FlexItem>
      </Flex>
    </Card>
  );
};

export default Events;
