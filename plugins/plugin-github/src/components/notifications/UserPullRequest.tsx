import {
  NotificationDrawerListItem,
  NotificationDrawerListItemBody,
  NotificationDrawerListItemHeader,
} from '@patternfly/react-core';
import React from 'react';

import { formatTime } from '@kobsio/shared';
import { getPRSubTitle } from '../../utils/helpers';

interface IAlertProps {
  url: string;
  title: string;
  updatedAt: string;
  number: number;
  user: string | undefined;
  state: string;
  createdAt: string;
  closedAt: string | null;
  mergedAt: string | null | undefined;
}

const UserPullRequest: React.FunctionComponent<IAlertProps> = ({
  url,
  title,
  updatedAt,
  number,
  user,
  state,
  createdAt,
  closedAt,
  mergedAt,
}: IAlertProps) => {
  const open = (): void => {
    window.open(url, '_blank');
  };

  return (
    <NotificationDrawerListItem variant="info" isRead={mergedAt ? true : false}>
      <NotificationDrawerListItemHeader variant="info" title={title} onClick={open} />
      <NotificationDrawerListItemBody timestamp={formatTime(Math.floor(new Date(updatedAt).getTime() / 1000))}>
        {getPRSubTitle(number, user, state, createdAt, closedAt, mergedAt)}
      </NotificationDrawerListItemBody>
    </NotificationDrawerListItem>
  );
};

export default UserPullRequest;
