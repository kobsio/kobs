import React from 'react';

import { ITimes } from '@kobsio/shared';
import ResourcesNotifications from '../resources/ResourcesNotifications';

interface IAppNotificationsProps {
  name: string;
  title: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options: any;
  times: ITimes;
}

const AppNotifications: React.FunctionComponent<IAppNotificationsProps> = ({
  name,
  title,
  options,
  times,
}: IAppNotificationsProps) => {
  if (name === 'resources') {
    if (options.satellites && options.clusters && options.resources && times) {
      const clusterIDs: string[] = options.satellites
        .map((satellite: string) =>
          options.clusters.map((cluster: string) => `/satellite/${satellite}/cluster/${cluster}`),
        )
        .flat();

      return (
        <ResourcesNotifications
          title={title}
          options={{
            clusterIDs: clusterIDs,
            columns: options.columns,
            filter: options.filter,
            namespaces: options.namespaces || [],
            param: options.selector || '',
            paramName: options.selectorType === 'fieldSelector' ? 'fieldSelector' : 'labelSelector',
            resourceIDs: options.resources || [],
            times: times,
          }}
        />
      );
    }
  }

  return <div></div>;
};

export default AppNotifications;
