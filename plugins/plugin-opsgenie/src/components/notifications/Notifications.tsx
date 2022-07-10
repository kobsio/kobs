import React from 'react';

import Alerts from './Alerts';
import { IPluginNotificationsProps } from '@kobsio/shared';
import Incidents from './Incidents';

const Notifications: React.FunctionComponent<IPluginNotificationsProps> = ({
  title,
  options,
  instance,
  times,
}: IPluginNotificationsProps) => {
  if (options && options.type === 'incidents' && options.query !== undefined) {
    return <Incidents title={title} instance={instance} options={options} times={times} />;
  }

  if (options && options.type === 'alerts' && options.query !== undefined) {
    return <Alerts title={title} instance={instance} options={options} times={times} />;
  }

  return <div></div>;
};

export default Notifications;
