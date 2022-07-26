import { NotificationDrawerGroup, NotificationDrawerList } from '@patternfly/react-core';
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import Alert from './Alert';
import { IAlert } from '../../utils/interfaces';
import { IPluginNotificationsProps } from '@kobsio/shared';
import { queryWithTime } from '../../utils/helpers';

const Alerts: React.FunctionComponent<IPluginNotificationsProps> = ({
  title,
  options,
  instance,
  times,
}: IPluginNotificationsProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const { data, refetch } = useQuery<IAlert[], Error>(['opsgenie/alerts', instance, options, times], async () => {
    try {
      const response = await fetch(
        `/api/plugins/opsgenie/alerts?query=${queryWithTime(options.query, times, options.interval)}`,
        {
          headers: {
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-plugin': instance.name,
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'x-kobs-satellite': instance.satellite,
          },
          method: 'get',
        },
      );
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
  });

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
        {data.map((alert) => (
          <Alert key={alert.id} instance={instance} alert={alert} refetch={refetch} />
        ))}
      </NotificationDrawerList>
    </NotificationDrawerGroup>
  );
};

export default Alerts;
