import React from 'react';

import Feed from './Feed';
import { IPluginNotificationsProps } from '@kobsio/shared';

const Notifications: React.FunctionComponent<IPluginNotificationsProps> = ({
  title,
  options,
  instance,
  times,
}: IPluginNotificationsProps) => {
  if (options && options.urls && Array.isArray(options.urls)) {
    return (
      <Feed
        title={title}
        instance={instance}
        urls={options.urls}
        sortBy={options.sortBy || 'published'}
        times={times}
      />
    );
  }

  return <div></div>;
};

export default Notifications;
