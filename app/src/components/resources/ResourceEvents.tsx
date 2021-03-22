import { Flex, FlexItem } from '@patternfly/react-core';
import { IRow, Table, TableBody, TableHeader } from '@patternfly/react-table';
import React, { useCallback, useEffect, useState } from 'react';
import { CoreV1EventList } from '@kubernetes/client-node';

import { ClustersPromiseClient, GetResourcesRequest, GetResourcesResponse } from 'proto/clusters_grpc_web_pb';
import { apiURL } from 'utils/constants';
import { emptyState } from 'utils/resources';
import { timeDifference } from 'utils/helpers';

// clustersService is the Clusters gRPC service, which is used to get a list of events.
const clustersService = new ClustersPromiseClient(apiURL, null, null);

interface IEventsProps {
  cluster: string;
  namespace: string;
  name: string;
}

// Events is the component to display the events for a resource. The resource is identified by the cluster, namespace
// and name. The event must contain the involvedObject.name=<NAME> to be listed for a resource.
const Events: React.FunctionComponent<IEventsProps> = ({ cluster, namespace, name }: IEventsProps) => {
  const [events, setEvents] = useState<IRow[]>(emptyState(4, ''));

  // fetchEvents is used to fetch all events to the provided resource. When the API returnes a list of resources, this
  // list is transformed into a the IRow interface, so we can display the events within the Table component.
  const fetchEvents = useCallback(async () => {
    try {
      const getResourcesRequest = new GetResourcesRequest();
      getResourcesRequest.setClustersList([cluster]);
      getResourcesRequest.setNamespacesList([namespace]);
      getResourcesRequest.setPath('/api/v1');
      getResourcesRequest.setResource('events');
      getResourcesRequest.setParamname('fieldSelector');
      getResourcesRequest.setParam(`involvedObject.name=${name}`);

      const getResourcesResponse: GetResourcesResponse = await clustersService.getResources(getResourcesRequest, null);
      const resourceList = getResourcesResponse.getResourcesList();

      if (resourceList.length > 0) {
        const eventsList: CoreV1EventList = JSON.parse(resourceList[0].getResourcelist());
        const tmpEvents: IRow[] = [];

        if (eventsList.items.length > 0) {
          for (const event of eventsList.items) {
            tmpEvents.push([
              event.lastTimestamp
                ? timeDifference(new Date().getTime(), new Date(event.lastTimestamp.toString()).getTime())
                : '-',
              event.type,
              event.reason,
              event.message,
            ]);
          }

          setEvents(tmpEvents);
        } else {
          setEvents(emptyState(4, ''));
        }
      } else {
        setEvents(emptyState(4, ''));
      }
    } catch (err) {
      setEvents(emptyState(4, err.message));
    }
  }, [cluster, namespace, name]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  return (
    <Flex direction={{ default: 'column' }}>
      <FlexItem>
        <Table
          aria-label="events"
          variant="compact"
          borders={false}
          isStickyHeader={false}
          cells={['Last seen', 'Type', 'Reason', 'Message']}
          rows={events}
        >
          <TableHeader />
          <TableBody />
        </Table>
      </FlexItem>
    </Flex>
  );
};

export default Events;
