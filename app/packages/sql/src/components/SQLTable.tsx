import { TableRow, TableCell, Table, TableBody, TableHead, TableContainer, Typography } from '@mui/material';
import { FunctionComponent } from 'react';

import { IRow } from './types';

interface ISQLRowProps {
  columns: string[];
  row: IRow;
}

/**
 * SQLRow represents a single row in the table
 */
const SQLRow: FunctionComponent<ISQLRowProps> = ({ columns, row }) => (
  <>
    <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
      {columns.map((column) => (
        <TableCell key={column}>
          <Typography>{`${row[column]}`}</Typography>
        </TableCell>
      ))}
    </TableRow>
  </>
);

interface ISQLTableProps {
  columns: string[];
  rows: IRow[];
}

/**
 * SQLTable renders a table view for the rows given inside props
 * when zero columns are given the table renders a preview of the document, where only the first 16 columns are shown
 */
const SQLTable: FunctionComponent<ISQLTableProps> = ({ columns: selectedColumns, rows }) => {
  const columns = selectedColumns.length === 0 ? ['preview'] : selectedColumns;
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            {columns.map((column) => (
              <TableCell key={column}>
                <Typography>{column}</Typography>
              </TableCell>
            ))}
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, i) => (
            <SQLRow key={i} columns={selectedColumns} row={row} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SQLTable;
