import {
  NotificationDrawerListItem,
  NotificationDrawerListItemBody,
  NotificationDrawerListItemHeader,
} from '@patternfly/react-core';
import React from 'react';

import Actions from '../panel/details/alert/Actions';
import { IAlert } from '../../utils/interfaces';
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

interface IAlertProps {
  instance: IPluginInstance;
  alert: IAlert;
  refetch: () => void;
}

const Alert: React.FunctionComponent<IAlertProps> = ({ instance, alert, refetch }: IAlertProps) => {
  const status = getStatus(alert.status || '', alert.snoozed || false, alert.acknowledged || false);
  const isRead = getIsRead(status, alert.owner);
  const variant = convertPriority(alert.priority);

  return (
    <NotificationDrawerListItem variant={variant} isRead={isRead}>
      <NotificationDrawerListItemHeader variant={variant} title={alert.message || ''}>
        <Actions instance={instance} alert={alert} refetch={refetch} />
      </NotificationDrawerListItemHeader>
      <NotificationDrawerListItemBody timestamp={alert.createdAt ? formatTimeWrapper(alert.createdAt) : ''}>
        <div>Status: {status}</div>
        {alert.owner && <div>Owner: {alert.owner}</div>}
        {alert.tags && alert.tags.length > 0 && <div>Tags: {alert.tags?.join(', ')}</div>}
      </NotificationDrawerListItemBody>
    </NotificationDrawerListItem>
  );
};

export default Alert;
