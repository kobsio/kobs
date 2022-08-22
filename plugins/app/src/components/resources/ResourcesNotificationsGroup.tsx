import {
  NotificationDrawerListItem,
  NotificationDrawerListItemBody,
  NotificationDrawerListItemHeader,
} from '@patternfly/react-core';
import React from 'react';
import { useNavigate } from 'react-router-dom';

import { IColumn, IResourceResponse } from './utils/interfaces';
import { customResourceDefinitionTableData, resourcesTableData } from './utils/tabledata';

interface IResourcesNotificationsGroupProps {
  resourceResponse: IResourceResponse;
  columns?: IColumn[];
  filter?: string;
}

const ResourcesNotificationsGroup: React.FunctionComponent<IResourcesNotificationsGroupProps> = ({
  resourceResponse,
  columns,
  filter,
}: IResourcesNotificationsGroupProps) => {
  const navigate = useNavigate();

  if (
    resourceResponse.resourceLists.filter(
      (resourceList) => resourceList.list && resourceList.list.items && resourceList.list.items.length > 0,
    ).length === 0
  ) {
    return null;
  }

  const tableData =
    resourceResponse.resource.id in resourcesTableData
      ? resourcesTableData[resourceResponse.resource.id]
      : customResourceDefinitionTableData(resourceResponse.resource);

  return (
    <React.Fragment>
      {tableData.rows(resourceResponse, columns, filter).map((row, rowIndex) => (
        <NotificationDrawerListItem
          key={rowIndex}
          variant="info"
          isRead={false}
          onClick={(): void =>
            navigate(
              `/resources?clusterID=${encodeURIComponent(`/satellite/${row.satellite}/cluster/${row.cluster}`)}${
                row.namespace ? `&namespace=${encodeURIComponent(row.namespace)}` : ''
              }&resourceID=${encodeURIComponent(resourceResponse.resource.id)}&param=metadata.name=${encodeURIComponent(
                row.name,
              )}&paramName=fieldSelector`,
            )
          }
        >
          <NotificationDrawerListItemHeader
            variant="info"
            title={row.namespace ? `${row.namespace}/${row.name}` : row.name}
          />
          <NotificationDrawerListItemBody>
            {columns ? (
              <React.Fragment>
                <div>Cluster: {row.cluster}</div>
                {columns.map((column, columnIndex) => (
                  <div key={columnIndex}>
                    {column.title}: {row.cells[columnIndex]}
                  </div>
                ))}
              </React.Fragment>
            ) : (
              tableData.columns.map((column, columnIndex) =>
                column && column !== 'Name' && column !== 'Namespace' ? (
                  <div key={columnIndex}>
                    {column}: {row.cells[columnIndex]}
                  </div>
                ) : null,
              )
            )}
          </NotificationDrawerListItemBody>
        </NotificationDrawerListItem>
      ))}
    </React.Fragment>
  );
};

export default ResourcesNotificationsGroup;
