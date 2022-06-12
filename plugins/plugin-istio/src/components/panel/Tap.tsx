import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useState } from 'react';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { IFilters, ILogLine } from '../../utils/interfaces';
import { IPluginInstance, ITimes } from '@kobsio/shared';
import DetailsTap from './details/DetailsTap';
import { getDirection } from '../../utils/helpers';

export interface IAdditionalColumns {
  title: string;
  label: string;
}

export interface ITapProps {
  instance: IPluginInstance;
  namespace: string;
  application: string;
  times: ITimes;
  liveUpdate: boolean;
  filters: IFilters;
  setDetails?: (details: React.ReactNode) => void;
}

const Tap: React.FunctionComponent<ITapProps> = ({
  instance,
  namespace,
  application,
  times,
  liveUpdate,
  filters,
  setDetails,
}: ITapProps) => {
  const [selectedRow, setSelectedRow] = useState<number>(-1);

  const { isError, isLoading, error, data, refetch } = useQuery<ILogLine[], Error>(
    ['istio/tap', instance, namespace, application, times, liveUpdate, filters],
    async () => {
      try {
        // When live update is enabled, we do not use the selected start and end time, instead we are using the same
        // time range but with the end time set to now.
        const timeEnd = liveUpdate ? Math.floor(Math.floor(Date.now() / 1000)) : times.timeEnd;
        const timeStart = liveUpdate
          ? Math.floor(Math.floor(Date.now() / 1000)) - (times.timeEnd - times.timeStart)
          : times.timeStart;

        const response = await fetch(
          `/api/plugins/istio/tap?timeStart=${timeStart}&timeEnd=${timeEnd}&application=${application}&namespace=${namespace}&filterUpstreamCluster=${encodeURIComponent(
            filters.upstreamCluster,
          )}&filterMethod=${encodeURIComponent(filters.method)}&filterPath=${encodeURIComponent(filters.path)}`,
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
    },
    {
      refetchInterval: liveUpdate ? 5000 : false,
    },
  );

  const handleRowClick = (rowIndex: number, line: ILogLine): void => {
    if (setDetails) {
      setDetails(
        <DetailsTap
          line={line}
          close={(): void => {
            setDetails(undefined);
            setSelectedRow(-1);
          }}
        />,
      );
      setSelectedRow(rowIndex);
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
        title="Could not get data"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<ILogLine[], Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <TableComposable aria-label="Tap" variant={TableVariant.compact} borders={true}>
      <Thead>
        <Tr>
          <Th>Direction</Th>
          <Th>Name</Th>
          <Th>Method</Th>
          <Th>Path</Th>
          <Th>Latency</Th>
          <Th>HTTP Status</Th>
          <Th>gRPC Status</Th>
        </Tr>
      </Thead>
      <Tbody>
        {data.map((line, index) => (
          <Tr
            key={index}
            isHoverable={setDetails ? true : false}
            isRowSelected={selectedRow === index}
            onClick={setDetails ? (): void => handleRowClick(index, line) : undefined}
          >
            <Td dataLabel="Direction">
              {line.hasOwnProperty('content.upstream_cluster') ? getDirection(line['content.upstream_cluster']) : '-'}
            </Td>
            <Td dataLabel="Upstream Cluster">
              {line.hasOwnProperty('content.upstream_cluster') ? line['content.upstream_cluster'] : '-'}
            </Td>
            <Td dataLabel="Method">{line.hasOwnProperty('content.method') ? line['content.method'] : '-'}</Td>
            <Td className="pf-u-text-wrap pf-u-text-break-word" dataLabel="Path">
              {line.hasOwnProperty('content.path') ? line['content.path'] : '-'}
            </Td>
            <Td className="pf-u-text-nowrap" dataLabel="Latency">
              {line.hasOwnProperty('content.duration') ? `${line['content.duration']} ms` : '-'}
            </Td>
            <Td className="pf-u-text-nowrap" dataLabel="HTTP Status">
              {line.hasOwnProperty('content.response_code') ? line['content.response_code'] : '-'}
            </Td>
            <Td className="pf-u-text-nowrap" dataLabel="gRPC Status">
              {line.hasOwnProperty('content.grpc_status') ? line['content.grpc_status'] : '-'}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </TableComposable>
  );
};

export default Tap;
