import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useState } from 'react';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { IPluginInstance, ITimes } from '@kobsio/shared';
import Details from './details/Details';
import { TType } from '../../utils/interfaces';
import { getValue } from '../../utils/helpers';
import { resources } from '../../utils/constants';

interface IPanelListProps {
  instance: IPluginInstance;
  type: TType;
  cluster: string;
  namespace: string;
  selector?: string;
  times?: ITimes;
  setDetails?: (details: React.ReactNode) => void;
}

const PanelList: React.FunctionComponent<IPanelListProps> = ({
  instance,
  type,
  cluster,
  namespace,
  selector,
  times,
  setDetails,
}: IPanelListProps) => {
  const resource = resources[type];
  const [selectedItem, setSelectedItem] = useState<number>(-1);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { isError, isLoading, error, data, refetch } = useQuery<any[], Error>(
    ['flux/list', instance, cluster, type, namespace, selector, times],
    async () => {
      try {
        const response = await fetch(
          `/api/resources?satellite=${instance.satellite}&cluster=${cluster}&namespace=${namespace}${
            selector ? `&paramName=labelSelector&param=${selector}` : ''
          }&resource=${resource.resource}&path=${resource.path}`,
          { method: 'get' },
        );
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          return json && json.items ? json.items : [];
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

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleItemClick = (itemIndex: number, item: any): void => {
    if (setDetails && resource) {
      setDetails(
        <Details
          instance={instance}
          cluster={cluster}
          type={type}
          item={item}
          close={(): void => {
            setDetails(undefined);
            setSelectedItem(-1);
          }}
          refetch={refetchhWithDelay}
        />,
      );
      setSelectedItem(itemIndex);
    }
  };

  if (isLoading) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <Alert
        variant={AlertVariant.danger}
        isInline={true}
        title={`Could not get ${resource.title}`}
        actionLinks={
          <React.Fragment>
            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
            <AlertActionLink onClick={(): Promise<QueryObserverResult<any[], Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  return (
    <TableComposable aria-label={resource.title} variant={TableVariant.compact} borders={false}>
      <Thead>
        <Tr>
          <Th>Name</Th>
          <Th>Namespace</Th>
          {resource.columns.map((column) => (
            <Th key={column.title}>{column.title}</Th>
          ))}
        </Tr>
      </Thead>
      <Tbody>
        {data && data.length > 0
          ? data.map((item, itemIndex) => (
              <Tr
                key={`${item.metadata.namespace}-${item.metadata.name}`}
                isHoverable={setDetails ? true : false}
                isRowSelected={selectedItem === itemIndex}
                onClick={(): void => (setDetails ? handleItemClick(itemIndex, item) : undefined)}
              >
                <Td>{item.metadata.name}</Td>
                <Td>{item.metadata.namespace}</Td>
                {resource.columns.map((column) => (
                  <Td key={column.title}>{getValue(item, column.jsonPath, column.type)}</Td>
                ))}
              </Tr>
            ))
          : null}
      </Tbody>
    </TableComposable>
  );
};

export default PanelList;
