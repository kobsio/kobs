import { Alert, AlertActionLink, AlertVariant, Button, ButtonVariant, Spinner } from '@patternfly/react-core';
import {
  IExtraColumnData,
  SortByDirection,
  TableComposable,
  TableVariant,
  Tbody,
  Td,
  Th,
  Thead,
  Tr,
} from '@patternfly/react-table';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MicroscopeIcon from '@patternfly/react-icons/dist/esm/icons/microscope-icon';

import { IPluginInstance, ITimes, pluginBasePath } from '@kobsio/shared';
import { escapeRegExp, formatNumber, getDirection } from '../../utils/helpers';
import DetailsTop from './details/DetailsTop';
import { IFilters } from '../../utils/interfaces';

export interface ISort {
  direction: 'asc' | 'desc';
  index: number;
}

const getSortParameters = (sort: ISort): [string, string] => {
  const sortDirection = sort.direction === 'asc' ? 'ASC' : 'DESC';

  switch (sort.index) {
    case 0:
      return ['count', sortDirection];
    case 1:
      return ['min', sortDirection];
    case 2:
      return ['max', sortDirection];
    case 3:
      return ['avg', sortDirection];
    case 4:
      return ['last', sortDirection];
    case 5:
      return ['sr', sortDirection];
    default:
      return ['count', sortDirection];
  }
};

export interface ITopProps {
  instance: IPluginInstance;
  namespace: string;
  application: string;
  times: ITimes;
  liveUpdate: boolean;
  filters: IFilters;
  setDetails?: (details: React.ReactNode) => void;
}

const Top: React.FunctionComponent<ITopProps> = ({
  instance,
  namespace,
  application,
  times,
  liveUpdate,
  filters,
  setDetails,
}: ITopProps) => {
  const [selectedRow, setSelectedRow] = useState<number>(-1);
  const [sort, setSort] = useState<ISort>({ direction: SortByDirection.desc, index: 0 });

  const { isError, isLoading, error, data, refetch } = useQuery<string[][], Error>(
    ['istio/top', instance, namespace, application, times, liveUpdate, filters, sort],
    async () => {
      try {
        // Instead of modifying the end and start time like in the tap view we are just setting the end time to now to
        // run the aggregations for the top view.
        const timeEnd = liveUpdate ? Math.floor(Math.floor(Date.now() / 1000)) : times.timeEnd;
        const [sortBy, sortDirection] = getSortParameters(sort);

        const response = await fetch(
          `/api/plugins/istio/top?timeStart=${
            times.timeStart
          }&timeEnd=${timeEnd}&application=${application}&namespace=${namespace}&filterUpstreamCluster=${encodeURIComponent(
            filters.upstreamCluster,
          )}&filterMethod=${encodeURIComponent(filters.method)}&filterPath=${encodeURIComponent(
            filters.path,
          )}&sortBy=${sortBy}&sortDirection=${sortDirection}`,
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

  const onTdClick = (rowIndex: number, row: string[]): void => {
    if (setDetails) {
      setDetails(
        <DetailsTop
          instance={instance}
          namespace={namespace}
          application={application}
          row={row}
          times={times}
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
            <AlertActionLink onClick={(): Promise<QueryObserverResult<string[][], Error>> => refetch()}>
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
          {['Count', 'Best', 'Worst', 'Avg', 'Last', 'SR'].map((column, index) => (
            <Th
              key={index}
              sort={{
                columnIndex: index,
                onSort: (
                  event: React.MouseEvent,
                  columnIndex: number,
                  sortByDirection: SortByDirection,
                  extraData: IExtraColumnData,
                ): void => {
                  setSort({ direction: sortByDirection, index: index });
                },
                sortBy: { direction: sort.direction, index: sort.index },
              }}
            >
              {column}
            </Th>
          ))}
          <Th />
        </Tr>
      </Thead>
      <Tbody>
        {data.map((row, index) => (
          <Tr key={index} isHoverable={setDetails ? true : false} isRowSelected={selectedRow === index}>
            <Td dataLabel="Direction" onClick={(): void => onTdClick(index, row)}>
              {getDirection(row[0]) || '-'}
            </Td>
            <Td dataLabel="Upstream Cluster" onClick={(): void => onTdClick(index, row)}>
              {row[0] || '-'}
            </Td>
            <Td dataLabel="Method" onClick={(): void => onTdClick(index, row)}>
              {row[1] || '-'}
            </Td>
            <Td
              className="pf-u-text-wrap pf-u-text-break-word"
              dataLabel="Path"
              onClick={(): void => onTdClick(index, row)}
            >
              {row[2] || '-'}
            </Td>
            <Td className="pf-u-text-nowrap" dataLabel="Count" onClick={(): void => onTdClick(index, row)}>
              {formatNumber(row[3])}
            </Td>
            <Td className="pf-u-text-nowrap" dataLabel="Best" onClick={(): void => onTdClick(index, row)}>
              {formatNumber(row[4], 'ms', 0)}
            </Td>
            <Td className="pf-u-text-nowrap" dataLabel="Worst" onClick={(): void => onTdClick(index, row)}>
              {formatNumber(row[5], 'ms', 0)}
            </Td>
            <Td className="pf-u-text-nowrap" dataLabel="Avg" onClick={(): void => onTdClick(index, row)}>
              {formatNumber(row[6], 'ms', 0)}
            </Td>
            <Td className="pf-u-text-nowrap" dataLabel="Last" onClick={(): void => onTdClick(index, row)}>
              {formatNumber(row[7], 'ms', 0)}
            </Td>
            <Td className="pf-u-text-nowrap" dataLabel="SR" onClick={(): void => onTdClick(index, row)}>
              {formatNumber(row[8], '%', 2)}
            </Td>
            <Td noPadding={true} style={{ padding: 0 }}>
              <Link
                to={`${pluginBasePath(instance)}/${namespace}/${application}?view=tap&timeStart=${
                  times.timeStart
                }&timeEnd=${times.timeEnd}&filterUpstreamCluster=${encodeURIComponent(
                  row[0],
                )}&filterMethod=${encodeURIComponent(row[1])}&filterPath=${encodeURIComponent(escapeRegExp(row[2]))}`}
              >
                <Button variant={ButtonVariant.plain}>
                  <MicroscopeIcon />
                </Button>
              </Link>
            </Td>
          </Tr>
        ))}
      </Tbody>
    </TableComposable>
  );
};

export default Top;
