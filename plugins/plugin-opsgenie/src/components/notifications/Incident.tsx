import {
  NotificationDrawerListItem,
  NotificationDrawerListItemBody,
  NotificationDrawerListItemHeader,
} from '@patternfly/react-core';
import React from 'react';

import Actions from '../panel/details/incident/Actions';
import { IIncident } from '../../utils/interfaces';
import { IPluginInstance } from '@kobsio/shared';
import { formatTimeWrapper } from '../../utils/helpers';

const getStatus = (status: string, snoozed: boolean, acknowledged: boolean): string => {
  if (status === 'closed') {
    return 'closed';
  } else if (status === 'resolved') {
    return 'resolved';
  } else if (snoozed) {
    return 'snoozed';
  } else if (acknowledged) {
    return 'acknowledged';
  } else {
    return status;
  }
};

const getIsRead = (status: string, owner?: string): boolean => {
  if (status === 'closed' || status === 'resolved' || status === 'snoozed' || status === 'acknowledged' || owner) {
    return true;
  }

  return false;
};

const convertPriority = (priority?: string): 'default' | 'success' | 'danger' | 'warning' | 'info' => {
  switch (priority) {
    case 'P1':
      return 'danger';
    case 'P2':
      return 'danger';
    case 'P3':
      return 'warning';
    case 'P4':
      return 'success';
    case 'P5':
      return 'info';
    default:
      return 'default';
  }
};

interface IIncidentProps {
  instance: IPluginInstance;
  incident: IIncident;
  refetch: () => void;
}

const Incident: React.FunctionComponent<IIncidentProps> = ({ instance, incident, refetch }: IIncidentProps) => {
  const variant = convertPriority(incident.priority);
  const status = getStatus(incident.status || '', false, false);
  const isRead = getIsRead(status, incident.ownerTeam);

  return (
    <NotificationDrawerListItem variant={variant} isRead={isRead}>
      <NotificationDrawerListItemHeader variant={variant} title={incident.message || ''}>
        <Actions instance={instance} incident={incident} refetch={refetch} />
      </NotificationDrawerListItemHeader>
      <NotificationDrawerListItemBody timestamp={incident.createdAt ? formatTimeWrapper(incident.createdAt) : ''}>
        <div>Status: {status}</div>
        {incident.ownerTeam && <div>Owner: {incident.ownerTeam}</div>}
        {incident.tags && incident.tags.length > 0 && <div>Tags: {incident.tags?.join(', ')}</div>}
      </NotificationDrawerListItemBody>
    </NotificationDrawerListItem>
  );
};

export default Incident;
