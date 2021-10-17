import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';

import { IFilters, ILogLine } from '../../utils/interfaces';
import DetailsTap from './details/DetailsTap';
import { IPluginTimes } from '@kobsio/plugin-core';
import { getDirection } from '../../utils/helpers';

export interface IAdditionalColumns {
  title: string;
  label: string;
}

export interface ITapProps {
  name: string;
  namespace: string;
  application: string;
  times: IPluginTimes;
  liveUpdate: boolean;
  filters: IFilters;
  setDetails?: (details: React.ReactNode) => void;
}

const Tap: React.FunctionComponent<ITapProps> = ({
  name,
  namespace,
  application,
  times,
  liveUpdate,
  filters,
  setDetails,
}: ITapProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<ILogLine[], Error>(
    ['istio/tap', name, namespace, application, times, liveUpdate, filters],
    async () => {
      try {
        // When live update is enabled, we do not use the selected start and end time, instead we are using the same
        // time range but with the end time set to now.
        const timeEnd = liveUpdate ? Math.floor(Math.floor(Date.now() / 1000)) : times.timeEnd;
        const timeStart = liveUpdate
          ? Math.floor(Math.floor(Date.now() / 1000)) - (times.timeEnd - times.timeStart)
          : times.timeStart;

        const response = await fetch(
          `/api/plugins/istio/tap/${name}?timeStart=${timeStart}&timeEnd=${timeEnd}&application=${application}&namespace=${namespace}&filterName=${encodeURIComponent(
            filters.name,
          )}&filterMethod=${encodeURIComponent(filters.method)}&filterPath=${encodeURIComponent(filters.path)}`,
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
      } catch (err) {
        throw err;
      }
    },
    {
      refetchInterval: liveUpdate ? 5000 : false,
    },
  );

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
    <TableComposable aria-label="Tap" variant={TableVariant.compact} borders={false}>
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
            onClick={
              setDetails
                ? (): void => setDetails(<DetailsTap line={line} close={(): void => setDetails(undefined)} />)
                : undefined
            }
          >
            <Td dataLabel="Direction">
              {line.hasOwnProperty('content.upstream_cluster') ? getDirection(line['content.upstream_cluster']) : '-'}
            </Td>
            <Td dataLabel="Name">{line.hasOwnProperty('content.authority') ? line['content.authority'] : '-'}</Td>
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
