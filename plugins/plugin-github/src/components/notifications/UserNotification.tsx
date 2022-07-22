import {
  Button,
  ButtonVariant,
  NotificationDrawerListItem,
  NotificationDrawerListItemBody,
  NotificationDrawerListItemHeader,
} from '@patternfly/react-core';
import React, { useContext } from 'react';
import ExternalLinkAltIcon from '@patternfly/react-icons/dist/esm/icons/external-link-alt-icon';

import { AuthContext, IAuthContext } from '../../context/AuthContext';
import { formatTime } from '@kobsio/shared';

interface IAlertProps {
  url: string;
  unread: boolean;
  title: string;
  repo: string;
  updatedAt: string;
}

const UserNotification: React.FunctionComponent<IAlertProps> = ({
  url,
  unread,
  title,
  repo,
  updatedAt,
}: IAlertProps) => {
  const authContext = useContext<IAuthContext>(AuthContext);

  const selectNotification = async (): Promise<void> => {
    try {
      const octokit = authContext.getOctokitClient();
      const response = await octokit.request(`GET ${url}`);

      if (response && response.data && response.data.html_url) {
        window.open(response.data.html_url, '_blank');
      }
    } catch (err) {}
  };

  return (
    <NotificationDrawerListItem variant="info" isRead={!unread}>
      <NotificationDrawerListItemHeader variant="info" title={title}>
        <Button variant={ButtonVariant.plain} onClick={selectNotification}>
          <ExternalLinkAltIcon />
        </Button>
      </NotificationDrawerListItemHeader>
      <NotificationDrawerListItemBody timestamp={formatTime(Math.floor(new Date(updatedAt).getTime() / 1000))}>
        {repo}
      </NotificationDrawerListItemBody>
    </NotificationDrawerListItem>
  );
};

export default UserNotification;
