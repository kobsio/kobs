import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useState } from 'react';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';

import { IRowValues, IRows } from '@kobsio/plugin-prometheus';
import DetailsMetrics from './details/DetailsMetrics';
import { IPluginTimes } from '@kobsio/plugin-core';
import { formatNumber } from '../../utils/helpers';

export interface IAdditionalColumns {
  title: string;
  label: string;
}

export interface IMetricsTableProps {
  name: string;
  namespaces: string[];
  application?: string;
  label: string;
  groupBy: string;
  reporter: string;
  times: IPluginTimes;
  additionalColumns?: IAdditionalColumns[];
  setDetails?: (details: React.ReactNode) => void;
  goTo?: (row: IRowValues) => void;
}

const MetricsTable: React.FunctionComponent<IMetricsTableProps> = ({
  name,
  namespaces,
  application,
  label,
  groupBy,
  reporter,
  times,
  additionalColumns,
  setDetails,
  goTo,
}: IMetricsTableProps) => {
  const [selectedRow, setSelectedRow] = useState<number>(-1);

  const { isError, isLoading, error, data, refetch } = useQuery<IRows, Error>(
    ['istio/metrics', name, namespaces, application, label, groupBy, reporter, times],
    async () => {
      try {
        const namespaceParams = namespaces ? namespaces.map((namespace) => `&namespace=${namespace}`) : [];

        const response = await fetch(
          `/api/plugins/istio/metrics/${name}?timeStart=${times.timeStart}&timeEnd=${times.timeEnd}&application=${
            application ? application : ''
          }&label=${label}&groupBy=${groupBy}&reporter=${reporter}${
            namespaceParams.length > 0 ? namespaceParams.join('') : ''
          }`,
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
  );

  const handleRowClick = (rowIndex: number, rowValues: IRowValues): void => {
    if (setDetails) {
      setDetails(
        <DetailsMetrics
          name={name}
          namespace={rowValues['destination_workload_namespace']}
          application={rowValues['destination_app']}
          row={rowValues}
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
        title="Could not get metrics"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IRows, Error>> => refetch()}>
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
    <TableComposable aria-label="Metrics" variant={TableVariant.compact} borders={true}>
      <Thead>
        <Tr>
          <Th>Application</Th>
          <Th>Namespace</Th>
          {additionalColumns ? additionalColumns.map((column, index) => <Th key={index}>{column.title}</Th>) : null}
          <Th>SR</Th>
          <Th>RPS</Th>
          <Th>P50</Th>
          <Th>P90</Th>
          <Th>P99</Th>
        </Tr>
      </Thead>
      <Tbody>
        {Object.keys(data).map((key, rowIndex) => (
          <Tr
            key={key}
            isHoverable={goTo || setDetails ? true : false}
            isRowSelected={selectedRow === rowIndex}
            onClick={
              goTo
                ? (): void => goTo(data[key])
                : setDetails
                ? (): void => handleRowClick(rowIndex, data[key])
                : undefined
            }
          >
            <Td dataLabel="Application">{data[key]['destination_app']}</Td>
            <Td dataLabel="Namespace">{data[key]['destination_workload_namespace']}</Td>
            {additionalColumns
              ? additionalColumns.map((column, columnIndex) => (
                  <Td key={columnIndex} dataLabel={column.title}>
                    {data[key][column.label]}
                  </Td>
                ))
              : null}
            <Td dataLabel="SR">{formatNumber(data[key]['value-1'], '%')}</Td>
            <Td dataLabel="RPS">{formatNumber(data[key]['value-2'])}</Td>
            <Td dataLabel="P50">{formatNumber(data[key]['value-3'], 'ms')}</Td>
            <Td dataLabel="P90">{formatNumber(data[key]['value-4'], 'ms')}</Td>
            <Td dataLabel="P99">{formatNumber(data[key]['value-5'], 'ms')}</Td>
          </Tr>
        ))}
      </Tbody>
    </TableComposable>
  );
};

export default MetricsTable;
