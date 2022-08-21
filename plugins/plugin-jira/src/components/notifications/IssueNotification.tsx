import {
  NotificationDrawerListItem,
  NotificationDrawerListItemBody,
  NotificationDrawerListItemHeader,
} from '@patternfly/react-core';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { IPluginInstance, formatTime, pluginBasePath } from '@kobsio/shared';
import { IIssue } from '../../utils/issue';

interface IIssueNotificationProps {
  instance: IPluginInstance;
  issue: IIssue;
}

const IssueNotification: React.FunctionComponent<IIssueNotificationProps> = ({
  instance,
  issue,
}: IIssueNotificationProps) => {
  const navigate = useNavigate();

  return (
    <NotificationDrawerListItem
      variant="info"
      isRead={false}
      onClick={(): void =>
        navigate(`${pluginBasePath(instance)}/search?jql=${encodeURIComponent(`key = ${issue.key}`)}`)
      }
    >
      <NotificationDrawerListItemHeader variant="info" title={issue.key || ''} />
      <NotificationDrawerListItemBody
        timestamp={formatTime(Math.floor(new Date(issue.fields?.updated || '').getTime() / 1000))}
      >
        {issue.fields?.summary}
      </NotificationDrawerListItemBody>
    </NotificationDrawerListItem>
  );
};

export default IssueNotification;
