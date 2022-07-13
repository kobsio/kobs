import { NotificationDrawerGroup, NotificationDrawerList } from '@patternfly/react-core';
import React, { useState } from 'react';
import { useQuery } from 'react-query';

import { IOptions, IResourceResponse } from './utils/interfaces';
import { customResourceDefinitionTableData, resourcesTableData } from './utils/tabledata';
import ResourcesNotificationsGroup from './ResourcesNotificationsGroup';

const getCount = (data: IResourceResponse[], filter: string | undefined): number => {
  let sum = 0;

  for (const resourceResponse of data) {
    if (
      resourceResponse.resourceLists.filter(
        (resourceList) => resourceList.list && resourceList.list.items && resourceList.list.items.length > 0,
      ).length > 0
    ) {
      const tableData =
        resourceResponse.resource.id in resourcesTableData
          ? resourcesTableData[resourceResponse.resource.id]
          : customResourceDefinitionTableData(resourceResponse.resource);
      sum = sum + tableData.rows(resourceResponse, undefined, filter).length;
    }
  }

  return sum;
};

interface IResourcesNotificationsProps {
  title: string;
  options: IOptions;
}

const ResourcesNotifications: React.FunctionComponent<IResourcesNotificationsProps> = ({
  title,
  options,
}: IResourcesNotificationsProps) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(false);

  const { data } = useQuery<IResourceResponse[], Error>(['app/resources/resources/_', options], async () => {
    const c = options.clusterIDs.map((clusterID) => `&clusterID=${encodeURIComponent(clusterID)}`);
    const n = options.clusterIDs
      .map((clusterID) =>
        options.namespaces.map(
          (namespace) => `&namespaceID=${encodeURIComponent(`${clusterID}/namespace/${namespace}`)}`,
        ),
      )
      .flat();
    const r = options.resourceIDs.map((resourceID) => `&resourceID=${encodeURIComponent(resourceID)}`);

    const response = await fetch(
      `/api/resources/_?paramName=${options.paramName}&param=${options.param}${c.length > 0 ? c.join('') : ''}${
        n.length > 0 ? n.join('') : ''
      }${r.length > 0 ? r.join('') : ''}`,
      {
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
      count={getCount(data, options.filter)}
      onExpand={(): void => setIsExpanded(!isExpanded)}
    >
      <NotificationDrawerList isHidden={!isExpanded}>
        {data.map((resourceResponse) => (
          <ResourcesNotificationsGroup
            key={resourceResponse.resource.id}
            resourceResponse={resourceResponse}
            columns={options.columns?.filter((column) => column.resource === resourceResponse.resource.id)}
            filter={options.filter}
          />
        ))}
      </NotificationDrawerList>
    </NotificationDrawerGroup>
  );
};

export default ResourcesNotifications;
