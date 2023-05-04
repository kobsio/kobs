import { APIContext, APIError, IPluginInstance, ITimes, UseQueryWrapper, formatTimeString } from '@kobsio/core';
import { TableRow, TableCell, Table, TableBody, TableHead, TableContainer, Card } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext } from 'react';

import { IColumns, ISQLData, ISQLDataRow } from '../utils/utils';

const renderCellValue = (value: string | number | string[] | number[], unit?: string): string => {
  if (Array.isArray(value)) {
    return `[${value.join(', ')}]`;
  }

  if (typeof value === 'object') {
    return JSON.stringify(value);
  }

  if (unit) {
    if (unit === 'time' && typeof value === 'string') {
      return formatTimeString(value);
    } else {
      return `${value} ${unit}`;
    }
  }

  return `${value}`;
};

const SQLRow: FunctionComponent<{
  columnOptions?: IColumns;
  columns: string[];
  row: ISQLDataRow;
}> = ({ columnOptions, columns, row }) => (
  <>
    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
      {columns.map((column) => (
        <TableCell key={column}>
          {row.hasOwnProperty(column)
            ? renderCellValue(
                row[column],
                columnOptions && columnOptions.hasOwnProperty(column) ? columnOptions[column].unit : undefined,
              )
            : ''}
        </TableCell>
      ))}
    </TableRow>
  </>
);

const SQLTable: FunctionComponent<{
  columnOptions?: IColumns;
  instance: IPluginInstance;
  query: string;
  times: ITimes;
}> = ({ columnOptions, instance, query, times }) => {
  const apiContext = useContext(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<ISQLData, APIError>(
    ['sql/query', instance, query, times],
    () => {
      return apiContext.client.get<ISQLData>(`/api/plugins/sql/query?query=${encodeURIComponent(query)}`, {
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      isError={isError}
      isLoading={isLoading}
      refetch={refetch}
      errorTitle="Failed to get data"
      isNoData={!data || !data.columns || data.columns.length === 0 || !data.rows || data.rows.length === 0}
      noDataTitle="No data was found"
    >
      {data?.columns && data?.rows && (
        <Card>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {data.columns.map((column) => (
                    <TableCell key={column}>
                      {columnOptions && columnOptions.hasOwnProperty(column) && columnOptions[column].title
                        ? columnOptions[column].title
                        : column}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.rows.map((row, index) => (
                  <SQLRow key={index} columnOptions={columnOptions} columns={data.columns ?? []} row={row} />
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Card>
      )}
    </UseQueryWrapper>
  );
};

export default SQLTable;
