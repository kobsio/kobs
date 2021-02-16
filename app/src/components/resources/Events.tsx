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

import { GetResourcesRequest, GetResourcesResponse } from '../../generated/proto/clusters_pb';
import { ClustersPromiseClient } from '../../generated/proto/clusters_grpc_web_pb';
import { apiURL } from '../../utils/constants';
import { timeDifference } from '../../utils/helpers';

const clustersService = new ClustersPromiseClient(apiURL, null, null);

const emptyState = [
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

const Events: React.FunctionComponent<IEventsProps> = ({ cluster, namespace, name }: IEventsProps) => {
  const [error, setError] = useState<string>('');
  const [events, setEvents] = useState<IRow[]>(emptyState);

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
        setEvents(emptyState);
      }
    } catch (err) {
      setError(err.message);
    }
  }, [cluster, namespace, name]);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  if (error) {
    return (
      <Flex className="pf-u-pt-md pf-u-pb-md " direction={{ default: 'column' }}>
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
    <Flex className="pf-u-mt-xl" direction={{ default: 'column' }}>
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
