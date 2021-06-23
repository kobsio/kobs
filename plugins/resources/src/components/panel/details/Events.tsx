import { Card, Flex, FlexItem } from '@patternfly/react-core';
import { IRow, Table, TableBody, TableHeader } from '@patternfly/react-table';
import React, { useContext } from 'react';
import { useQuery } from 'react-query';

import { ClustersContext, IClusterContext, emptyState } from '@kobsio/plugin-core';

interface IEventsProps {
  cluster: string;
  namespace: string;
  name: string;
}

// Events is the component to display the events for a resource. The resource is identified by the cluster, namespace
// and name. The event must contain the involvedObject.name=<NAME> to be listed for a resource.
const Events: React.FunctionComponent<IEventsProps> = ({ cluster, namespace, name }: IEventsProps) => {
  const clustersContext = useContext<IClusterContext>(ClustersContext);

  const { isError, isLoading, error, data } = useQuery<IRow[], Error>(
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
          <Table
            aria-label="events"
            variant="compact"
            borders={false}
            isStickyHeader={false}
            cells={clustersContext.resources?.events.columns}
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

export default Events;
