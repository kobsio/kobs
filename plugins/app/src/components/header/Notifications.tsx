import {
  Button,
  ButtonVariant,
  NotificationDrawer,
  NotificationDrawerBody,
  NotificationDrawerGroupList,
  NotificationDrawerHeader,
} from '@patternfly/react-core';
import React, { useContext, useState } from 'react';
import { RedoIcon } from '@patternfly/react-icons/dist/esm/icons/redo-icon';

import { INotificationsContext, NotificationsContext } from '../../context/NotificationsContext';
import { ITimes } from '@kobsio/shared';
import NotificationsGroup from './NotificationsGroup';

interface INotificationsProps {
  isNotificationDrawerExpanded: boolean;
  setIsNotificationDrawerExpanded: (value: boolean) => void;
}

const Notifications: React.FunctionComponent<INotificationsProps> = ({
  isNotificationDrawerExpanded,
  setIsNotificationDrawerExpanded,
}: INotificationsProps) => {
  const notificationsContext = useContext<INotificationsContext>(NotificationsContext);
  const [times, setTimes] = useState<ITimes>({
    time: 'last90Days',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 7776000,
  });

  return (
    <NotificationDrawer>
      <NotificationDrawerHeader onClose={(): void => setIsNotificationDrawerExpanded(false)}>
        <Button
          variant={ButtonVariant.plain}
          onClick={(): void =>
            setTimes({
              time: 'last90Days',
              timeEnd: Math.floor(Date.now() / 1000),
              timeStart: Math.floor(Date.now() / 1000) - 7776000,
            })
          }
        >
          <RedoIcon />
        </Button>
      </NotificationDrawerHeader>
      <NotificationDrawerBody>
        <NotificationDrawerGroupList>
          {notificationsContext.groups.map((group, groupIndex) => (
            <NotificationsGroup key={groupIndex} group={group} times={times} />
          ))}
        </NotificationDrawerGroupList>
      </NotificationDrawerBody>
    </NotificationDrawer>
  );
};

export default Notifications;
