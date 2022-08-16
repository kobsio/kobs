import { NotificationDrawerGroup, NotificationDrawerList } from '@patternfly/react-core';
import React, { useContext, useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import { AuthContext, IAuthContext } from '../../context/AuthContext';
import { INotificationProps, TUserNotifications } from '../../utils/interfaces';
import UserNotification from './UserNotification';

const UserNotifications: React.FunctionComponent<INotificationProps> = ({
  title,
  options,
  instance,
}: INotificationProps) => {
  const authContext = useContext<IAuthContext>(AuthContext);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const { data } = useQuery<TUserNotifications, Error>(
    ['github/users/notifications', authContext.organization, options, instance],
    async () => {
      try {
        const octokit = authContext.getOctokitClient();
        const notifications = await octokit.activity.listNotificationsForAuthenticatedUser({
          all: options && options.usernotifications.all ? options.usernotifications.all : false,
          page: 1,
          participating:
            options && options.usernotifications.participating ? options.usernotifications.participating : false,
          // eslint-disable-next-line @typescript-eslint/naming-convention
          per_page: 100,
        });
        return notifications.data;
      } catch (err) {
        throw err;
      }
    },
  );

  if (!data || data.length === 0) {
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
      count={data.length}
      onExpand={(): void => setIsExpanded(!isExpanded)}
    >
      <NotificationDrawerList isHidden={!isExpanded}>
        {data.map((notification) => (
          <UserNotification
            key={notification.id}
            url={notification.subject.url}
            unread={notification.unread}
            title={notification.subject.title}
            repo={notification.repository.full_name}
            updatedAt={notification.updated_at}
          />
        ))}
      </NotificationDrawerList>
    </NotificationDrawerGroup>
  );
};

export default UserNotifications;
