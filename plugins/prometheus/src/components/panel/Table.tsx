import { Alert, AlertActionLink, AlertVariant } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import { TableComposable, TableVariant, Tbody, Td, Th, Thead, Tr } from '@patternfly/react-table';
import React from 'react';

import { IColumn, IPanelOptions, IRows } from '../../utils/interfaces';
import { IPluginTimes, PluginCard } from '@kobsio/plugin-core';
import { getMappingValue, roundNumber } from '../../utils/helpers';
import Actions from './Actions';

interface ITableProps {
  name: string;
  title: string;
  description?: string;
  times: IPluginTimes;
  options: IPanelOptions;
}

const formatColumValue = (key: string, column: IColumn, data: IRows): string | number => {
  if (!column.name) {
    return '';
  }

  if (column.mappings) {
    return getMappingValue(data[key][column.name], column.mappings);
  }

  if (column.name.startsWith('value')) {
    return roundNumber(parseFloat(data[key][column.name]));
  }

  return data[key][column.name];
};

// The Table component can be used to show the result of multiple Prometheus queries in a table. To get the data for the
// table we have to use the table endpoint of the Prometheus plugin API. This will return a list of columns, where the
// identifier is the specified label of a query.
export const Table: React.FunctionComponent<ITableProps> = ({
  name,
  title,
  description,
  times,
  options,
}: ITableProps) => {
  const { isError, isFetching, error, data, refetch } = useQuery<IRows, Error>(
    ['prometheus/table', name, options.queries, times],
    async () => {
      try {
        if (!options.queries || !Array.isArray(options.queries) || options.queries.length === 0) {
          throw new Error('Queries are missing');
        }

        const response = await fetch(`/api/plugins/prometheus/table/${name}`, {
          body: JSON.stringify({
            queries: options.queries,
            resolution: '',
            timeEnd: times.timeEnd,
            timeStart: times.timeStart,
          }),
          method: 'post',
        });
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
    { keepPreviousData: true },
  );

  return (
    <PluginCard
      title={title}
      description={description}
      actions={<Actions name={name} isFetching={isFetching} times={times} queries={options.queries} />}
    >
      {!options.columns || isError ? (
        <Alert
          variant={AlertVariant.danger}
          isInline={true}
          title={!options.columns ? 'Columns are missing' : 'Could not get table data'}
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<IRows, Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>
            {!options.columns
              ? 'You have to provide a list of columns in the options for the Pormetheus plugin.'
              : error?.message}
          </p>
        </Alert>
      ) : data ? (
        <TableComposable aria-label="Legend" variant={TableVariant.compact} borders={false}>
          <Thead>
            <Tr>
              {options.columns.map((column, index) => (
                <Th key={index}>{column.title ? column.title : column.name}</Th>
              ))}
            </Tr>
          </Thead>
          <Tbody>
            {Object.keys(data).map((key) => (
              <Tr key={key}>
                {options.columns
                  ? options.columns.map((column, index) => (
                      <Td key={index} dataLabel={column.title ? column.title : column.name}>
                        {formatColumValue(key, column, data)}
                        {column.unit ? ` ${column.unit}` : ''}
                      </Td>
                    ))
                  : null}
              </Tr>
            ))}
          </Tbody>
        </TableComposable>
      ) : null}
    </PluginCard>
  );
};

export default Table;
