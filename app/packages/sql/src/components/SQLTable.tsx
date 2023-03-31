import { formatTime } from '@kobsio/core';
import { TableRow, TableCell, Table, TableBody, TableHead, TableContainer } from '@mui/material';
import { FunctionComponent } from 'react';

import { IColumns, IRow } from './types';

const renderCellValue = (value: string | number | string[] | number[], unit?: string): string => {
  if (Array.isArray(value)) {
    return `[${value.join(', ')}] ${unit}`;
  }

  if (unit) {
    if (unit === 'time') {
      return formatTime(new Date(value));
    } else {
      return `${value} ${unit}`;
    }
  }

  return `${value}`;
};

interface ISQLRowProps {
  columnOptions?: IColumns;
  columns: string[];
  row: IRow;
}

/**
 * SQLRow represents a single row in the table
 */
const SQLRow: FunctionComponent<ISQLRowProps> = ({ columnOptions, columns, row }) => (
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

interface ISQLTableProps {
  columnOptions?: IColumns;
  columns: string[];
  rows: IRow[];
}

/**
 * SQLTable renders a table view for the given rows and columns
 */
const SQLTable: FunctionComponent<ISQLTableProps> = ({ columnOptions, columns, rows }) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column}>
                {columnOptions && columnOptions.hasOwnProperty(column) && columnOptions[column].title
                  ? columnOptions[column].title
                  : column}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, i) => (
            <SQLRow key={i} columnOptions={columnOptions} columns={columns} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SQLTable;
