import React, { memo, useState } from 'react';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from 'react-query';

import { IPluginTimes, IResource, IResourceRow, emptyState } from '@kobsio/plugin-core';
import Details from './details/Details';

interface IPanelListItemProps {
  clusters: string[];
  namespaces: string[];
  resource: IResource;
  selector: string;
  times: IPluginTimes;
  setDetails?: (details: React.ReactNode) => void;
}

const PanelListItem: React.FunctionComponent<IPanelListItemProps> = ({
  clusters,
  namespaces,
  resource,
  selector,
  times,
  setDetails,
}: IPanelListItemProps) => {
  const [selectedRow, setSelectedRow] = useState<number>(-1);

  const { isError, isLoading, error, data, refetch } = useQuery<IResourceRow[], Error>(
    [
      'resources/panellistitem',
      clusters,
      namespaces,
      resource.scope,
      resource.resource,
      resource.path,
      selector,
      times,
    ],
    async () => {
      try {
        const clusterParams = clusters.map((cluster) => `cluster=${cluster}`).join('&');
        const namespaceParams = namespaces.map((namespace) => `namespace=${namespace}`).join('&');
        const path = resource.isCRD ? `/apis/${resource.path}` : resource.path;

        const response = await fetch(
          `/api/plugins/resources/resources?${clusterParams}${
            resource.scope === 'Namespaced' ? `&${namespaceParams}` : ''
          }&resource=${resource.resource}&path=${path}${selector ? `&paramName=labelSelector&param=${selector}` : ''}`,
          { method: 'get' },
        );
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          return resource.rows(json);
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
    },
  );

  // refetchhWithDelay is used to call the refetch function to get the resource, but with a delay of 3 seconds. This is
  // required, because sometime the Kubenretes isn't that fast after an action (edit, delete, ...) was triggered.
  const refetchhWithDelay = (): void => {
    setTimeout(() => {
      refetch();
    }, 3000);
  };

  const handleRowClick = (rowIndex: number, row: IResourceRow): void => {
    if (setDetails && resource) {
      setDetails(
        <Details
          request={resource}
          resource={row}
          close={(): void => {
            setDetails(undefined);
            setSelectedRow(-1);
          }}
          refetch={refetchhWithDelay}
        />,
      );
      setSelectedRow(rowIndex);
    }
  };

  return (
    <TableComposable aria-label={resource.title} variant={TableVariant.compact} borders={true}>
      <Thead>
        <Tr>
          {resource.columns.map((column) => (
            <Th key={column}>{column}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {data && data.length > 0 && data[0].cells?.length === resource.columns.length
          ? data.map((row, rowIndex) => (
              <Tr
                key={rowIndex}
                isHoverable={setDetails ? true : false}
                isRowSelected={selectedRow === rowIndex}
                onClick={(): void =>
                  setDetails && data && data.length > 0 && data[0].cells?.length === resource.columns.length
                    ? handleRowClick(rowIndex, row)
                    : undefined
                }
              >
                {row.cells.map((cell, cellIndex) => (
                  <Td key={cellIndex}>{cell}</Td>
                ))}
              </Tr>
            ))
          : emptyState(resource.columns.length, isLoading, isError, error)}
      </Tbody>
    </TableComposable>
  );
};

export default memo(PanelListItem, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
