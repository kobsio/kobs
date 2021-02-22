import {
  Alert,
  AlertActionLink,
  AlertVariant,
  Bullseye,
  EmptyState,
  EmptyStateIcon,
  EmptyStateVariant,
  Flex,
  FlexItem,
  Title,
} from '@patternfly/react-core';
import { IRow, Table, TableBody, TableHeader } from '@patternfly/react-table';
import React, { useCallback, useEffect, useState } from 'react';
import { CoreV1EventList } from '@kubernetes/client-node';
import SearchIcon from '@patternfly/react-icons/dist/js/icons/search-icon';

import { GetResourcesRequest, GetResourcesResponse } from 'generated/proto/clusters_pb';
import { ClustersPromiseClient } from 'generated/proto/clusters_grpc_web_pb';
import { apiURL } from 'utils/constants';
import { timeDifference } from 'utils/helpers';

const clustersService = new ClustersPromiseClient(apiURL, null, null);

// noEventsState is used when the gRPC API call doesn't returned any events for the provided resource.
const noEventsState = [
  {
    cells: [
      {
        props: { colSpan: 4 },
        title: (
          <Bullseye>
            <EmptyState variant={EmptyStateVariant.small}>
              <EmptyStateIcon icon={SearchIcon} />
              <Title headingLevel="h2" size="lg">
                No events found
              </Title>
            </EmptyState>
          </Bullseye>
        ),
      },
    ],
    heightAuto: true,
  },
];

interface IEventsProps {
  cluster: string;
  namespace: string;
  name: string;
}

// Events is the component to display the events for a resource. The resource is identified by the cluster, namespace
// and name. The event must contain the involvedObject.name=<NAME> to be listed for a resource.
const Events: React.FunctionComponent<IEventsProps> = ({ cluster, namespace, name }: IEventsProps) => {
  const [error, setError] = useState<string>('');
  const [events, setEvents] = useState<IRow[]>(noEventsState);

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
        setEvents(noEventsState);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [cluster, namespace, name]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // When an error occurrs during the API call we show an Alert component, which the error message instead of the table.
  // The alert also contains a retry button, so that a user can rerun the API call.
  if (error) {
    return (
      <Flex direction={{ default: 'column' }}>
        <FlexItem>
          <Alert
            variant={AlertVariant.danger}
            isInline={true}
            title="Could not load events"
            actionLinks={<AlertActionLink onClick={(): Promise<void> => fetchEvents()}>Retry</AlertActionLink>}
          >
            <p>{error}</p>
          </Alert>
        </FlexItem>
      </Flex>
    );
  }

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
