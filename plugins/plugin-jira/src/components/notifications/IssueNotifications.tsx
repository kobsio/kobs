import { NotificationDrawerGroup, NotificationDrawerList } from '@patternfly/react-core';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { IIssue } from '../../utils/issue';
import { INotificationProps } from '../../utils/interfaces';
import IssueNotification from './IssueNotification';

const IssueNotifications: React.FunctionComponent<INotificationProps> = ({
  title,
  options,
  instance,
}: INotificationProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const { data } = useQuery<{ issues: IIssue[]; total: number }, Error>(
    ['jira/issues', instance, options],
    async () => {
      try {
        const response = await fetch(`/api/plugins/jira/issues?jql=${options.jql || ''}&startAt=0&maxResults=50`, {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-plugin': instance.name,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-satellite': instance.satellite,
          },
          method: 'get',
        });
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          return json;
        } else {
          if (json.error) {
            throw new Error(json.error);
          } else {
            throw new Error('An unknown error occured');
          }
        }
      } catch (err) {
        throw err;
      }
    },
  );

  if (!data || data.issues.length === 0) {
    return (
      <NotificationDrawerGroup title={title} isExpanded={false} count={0}>
        <NotificationDrawerList isHidden={true} />
      </NotificationDrawerGroup>
    );
  }

  return (
    <NotificationDrawerGroup
      title={title}
      isExpanded={isExpanded}
      count={data.issues.length}
      onExpand={(): void => setIsExpanded(!isExpanded)}
    >
      <NotificationDrawerList isHidden={!isExpanded}>
        {data.issues.map((issue) => (
          <IssueNotification key={issue.id} instance={instance} issue={issue} />
        ))}
      </NotificationDrawerList>
    </NotificationDrawerGroup>
  );
};

export default IssueNotifications;
