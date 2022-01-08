import React, { memo, useContext, useState } from 'react';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import { useQuery } from 'react-query';

import { ClustersContext, IClusterContext, IResourceRow, emptyState } from '@kobsio/plugin-core';
import Details from '../panel/details/Details';
import { TApiType } from '../../utils/interfaces';

interface IPanelListProps {
  name: string;
  title: string;
  cluster: string;
  namespace: string;
  selector?: string;
  type: TApiType;
  setDetails?: (details: React.ReactNode) => void;
}

const PanelList: React.FunctionComponent<IPanelListProps> = ({
  name,
  title,
  type,
  cluster,
  namespace,
  selector,
  setDetails,
}: IPanelListProps) => {
  const clustersContext = useContext<IClusterContext>(ClustersContext);
  const resource =
    clustersContext.resources && clustersContext.resources.hasOwnProperty(type)
      ? clustersContext.resources[type]
      : undefined;
  const [selectedRow, setSelectedRow] = useState<number>(-1);

  const { isError, isLoading, error, data, refetch } = useQuery<IResourceRow[], Error>(
    ['flux/list', name, cluster, type, namespace, selector],
    async () => {
      try {
        if (!resource) {
          throw new Error('Could not find resource');
        }

        const response = await fetch(
          `/api/plugins/resources/resources?cluster=${cluster}&namespace=${namespace}${
            selector ? `&paramName=labelSelector&param=${selector}` : ''
          }&resource=${resource.resource}&path=/apis/${resource.path}`,
          { method: 'get' },
        );
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          return resource.rows(json, undefined);
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
          name={name}
          type={type}
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
    <TableComposable aria-label={title} variant={TableVariant.compact} borders={false}>
      <Thead>
        <Tr>
          {resource?.columns.map((column) => (
            <Th key={column}>{column}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {data && data.length > 0 && data[0].cells?.length === resource?.columns.length
          ? data.map((row, rowIndex) => (
              <Tr
                key={rowIndex}
                isHoverable={setDetails ? true : false}
                isRowSelected={selectedRow === rowIndex}
                onClick={(): void =>
                  setDetails && resource && data && data.length > 0 && data[0].cells?.length === resource.columns.length
                    ? handleRowClick(rowIndex, row)
                    : undefined
                }
              >
                {row.cells.map((cell, cellIndex) => (
                  <Td key={cellIndex}>{cell}</Td>
                ))}
              </Tr>
            ))
          : emptyState(resource?.columns.length || 3, isLoading, isError, error)}
      </Tbody>
    </TableComposable>
  );
};

export default memo(PanelList, (prevProps, nextProps) => {
  if (JSON.stringify(prevProps) === JSON.stringify(nextProps)) {
    return true;
  }

  return false;
});
