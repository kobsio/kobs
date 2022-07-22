import React from 'react';

import { AuthContextProvider } from '../../context/AuthContext';
import { INotificationProps } from '../../utils/interfaces';
import UserNotifications from './UserNotifications';
import UserPullRequests from './UserPullRequests';

const Notifications: React.FunctionComponent<INotificationProps> = ({
  title,
  options,
  instance,
  times,
}: INotificationProps) => {
  if (options && options.type === 'userpullrequests') {
    return (
      <AuthContextProvider title={title} isNotification={true} instance={instance}>
        <UserPullRequests title={title} options={options} instance={instance} times={times} />
      </AuthContextProvider>
    );
  }

  if (options && options.type === 'usernotifications') {
    return (
      <AuthContextProvider title={title} isNotification={true} instance={instance}>
        <UserNotifications title={title} options={options} instance={instance} times={times} />
      </AuthContextProvider>
    );
  }

  return <div></div>;
};

export default Notifications;
