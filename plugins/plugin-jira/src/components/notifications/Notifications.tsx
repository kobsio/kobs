import React from 'react';

import { AuthContextProvider } from '../../context/AuthContext';
import { INotificationProps } from '../../utils/interfaces';
import IssueNotifications from './IssueNotifications';

const Notifications: React.FunctionComponent<INotificationProps> = ({
  title,
  options,
  instance,
  times,
}: INotificationProps) => {
  if (options) {
    return (
      <AuthContextProvider title={title} isNotification={true} instance={instance}>
        <IssueNotifications title={title} options={options} instance={instance} times={times} />
      </AuthContextProvider>
    );
  }

  return <div></div>;
};

export default Notifications;
