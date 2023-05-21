import {
  APIContext,
  APIError,
  IPluginInstance,
  ITimes,
  PluginPanel,
  PluginPanelActionButton,
  UseQueryWrapper,
  fileDownload,
  formatTimeString,
} from '@kobsio/core';
import { Download } from '@mui/icons-material';
import {
  TableRow,
  TableCell,
  Table,
  TableBody,
  TableHead,
  TableContainer,
  Card,
  Menu,
  MenuItem,
  ListItemText,
  ListItemIcon,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, MouseEvent, useContext, useState } from 'react';

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

const SQLActions: FunctionComponent<{
  columnOptions?: IColumns;
  columns: string[];
  rows: ISQLDataRow[];
}> = ({ columnOptions, columns, rows }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  /**
   * `handleOpenMenu` opens the menu, which is used to display the download option.
   */
  const handleOpenMenu = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  /**
   * `handleCloseMenu` closes the menu, wich displays the download option.
   */
  const handleCloseMenu = (e: Event) => {
    setAnchorEl(null);
  };

  /**
   * `downloadCSV` lets a user donwload the returned documents as csv file, with the selected fields as columns.
   */
  const downloadCSV = () => {
    let csv = '';

    for (const column of columns) {
      csv = csv + column + ';';
    }

    csv = csv + '\r\n';

    for (const row of rows) {
      for (const column of columns) {
        csv =
          csv +
          (row.hasOwnProperty(column)
            ? renderCellValue(
                row[column],
                columnOptions && columnOptions.hasOwnProperty(column) ? columnOptions[column].unit : undefined,
              )
            : '') +
          ';';
      }

      csv = csv + '\r\n';
    }

    fileDownload(csv, 'sql-export.csv');
  };

  return (
    <>
      <PluginPanelActionButton props={{ onClick: handleOpenMenu }} />

      <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
        <MenuItem onClick={downloadCSV} aria-label="Download CSV">
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download CSV</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

const SQLTable: FunctionComponent<{
  columnOptions?: IColumns;
  instance: IPluginInstance;
  isPanel: boolean;
  query: string;
  times: ITimes;
}> = ({ columnOptions, instance, query, isPanel, times }) => {
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

  if (isPanel) {
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
  }

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
        <PluginPanel
          title="Result"
          actions={<SQLActions columnOptions={columnOptions} columns={data.columns ?? []} rows={data.rows ?? []} />}
        >
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
        </PluginPanel>
      )}
    </UseQueryWrapper>
  );
};

export default SQLTable;
