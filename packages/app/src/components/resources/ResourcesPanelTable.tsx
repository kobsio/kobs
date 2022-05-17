import { Bullseye, EmptyState, EmptyStateBody, EmptyStateIcon, EmptyStateVariant, Title } from '@patternfly/react-core';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';
import { SearchIcon } from '@patternfly/react-icons';

import { IColumn, IResourceResponse } from './utils/interfaces';
import { IResourceRow, customResourceDefinitionTableData, resourcesTableData } from './utils/tabledata';
import { IResource } from '../../resources/clusters';

interface IResourcesPanelTableProps {
  resourceResponse: IResourceResponse;
  columns?: IColumn[];
  selectedRow: number;
  selectRow?: (rowIndex: number, resource: IResource, resourceData: IResourceRow) => void;
}

const ResourcesPanelTable: React.FunctionComponent<IResourcesPanelTableProps> = ({
  resourceResponse,
  columns,
  selectedRow,
  selectRow,
}: IResourcesPanelTableProps) => {
  const tableData =
    resourceResponse.resource.id in resourcesTableData
      ? resourcesTableData[resourceResponse.resource.id]
      : customResourceDefinitionTableData(resourceResponse.resource);

  return (
    <TableComposable
      aria-label={`${resourceResponse.resource.title} table`}
      variant={TableVariant.compact}
      borders={true}
    >
      <Thead>
        {columns ? (
          <Tr>
            <Th>Name</Th>
            <Th>Namespace</Th>
            <Th>Cluster (Satellite)</Th>
            {columns.map((column) => (
              <Th key={column.title}>{column.title}</Th>
            ))}
          </Tr>
        ) : (
          <Tr>
            {tableData.columns.map((column) => (
              <Th key={column}>{column}</Th>
            ))}
          </Tr>
        )}
      </Thead>
      <Tbody>
        {resourceResponse.errors ||
        !resourceResponse.resourceLists ||
        resourceResponse.resourceLists.length === 0 ||
        resourceResponse.resourceLists.filter(
          (resourceList) => resourceList.list && resourceList.list.items && resourceList.list.items.length > 0,
        ).length === 0 ? (
          <Tr>
            <Td colSpan={columns ? 3 + columns.length : tableData.columns.length}>
              <Bullseye>
                <EmptyState variant={EmptyStateVariant.small}>
                  <EmptyStateIcon icon={SearchIcon} />
                  <Title headingLevel="h2" size="lg">
                    {resourceResponse.errors ? 'An error occured' : 'No resources found'}
                  </Title>
                  <EmptyStateBody>
                    {resourceResponse.errors
                      ? resourceResponse.errors.join('\n')
                      : 'We could not found any resources for the selected filter criteria'}
                  </EmptyStateBody>
                </EmptyState>
              </Bullseye>
            </Td>
          </Tr>
        ) : (
          tableData.rows(resourceResponse, columns).map((row, rowIndex) => (
            <Tr
              key={rowIndex}
              isHoverable={selectRow ? true : false}
              isRowSelected={selectedRow === rowIndex}
              onClick={(): void => (selectRow ? selectRow(rowIndex, resourceResponse.resource, row) : undefined)}
            >
              {row.cells.map((cell, cellIndex) => (
                <Td key={cellIndex}>{cell}</Td>
              ))}
            </Tr>
          ))
        )}
      </Tbody>
    </TableComposable>
  );
};

export default ResourcesPanelTable;
