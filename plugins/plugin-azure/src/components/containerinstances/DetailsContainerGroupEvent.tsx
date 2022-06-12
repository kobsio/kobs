import { Td, Tr } from '@patternfly/react-table';
import { Event } from '@azure/arm-containerinstance';
import React from 'react';

import { formatTime } from '../../utils/helpers';

interface IDetailsContainerGroupEventProps {
  event: Event;
}

const DetailsContainerGroupEvent: React.FunctionComponent<IDetailsContainerGroupEventProps> = ({
  event,
}: IDetailsContainerGroupEventProps) => {
  return (
    <Tr>
      <Td dataLabel="Name">{event.name}</Td>
      <Td dataLabel="Type">{event.type}</Td>
      <Td dataLabel="Count">{event.count}</Td>
      <Td dataLabel="First Seen">
        {event.firstTimestamp ? formatTime(event.firstTimestamp as unknown as string) : '-'}
      </Td>
      <Td dataLabel="Last Seen">{event.lastTimestamp ? formatTime(event.lastTimestamp as unknown as string) : '-'}</Td>
      <Td dataLabel="Message">{event.message}</Td>
    </Tr>
  );
};

export default DetailsContainerGroupEvent;
