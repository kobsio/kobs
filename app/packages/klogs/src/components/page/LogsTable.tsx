import { fileDownload } from '@kobsio/core';
import { KeyboardArrowRight, KeyboardArrowDown, Download } from '@mui/icons-material';
import {
  TableRow,
  TableCell,
  IconButton,
  Table,
  TableBody,
  TableHead,
  TableContainer,
  TableSortLabel,
  Typography,
  Tooltip,
} from '@mui/material';
import { FunctionComponent, useState } from 'react';

import DocumentDetails from './LogsDocumentDetails';
import RowPreview from './LogsRowPreview';

import { IRow } from '../common/types';

interface ILogRowProps {
  fields: string[];
  handlers: ILogsTableHandlers;
  options: ILogsTableOptions;
  row: IRow;
}

/**
 * LogRow represents a single row in the table
 */
const LogRow: FunctionComponent<ILogRowProps> = ({ fields, handlers, options, row }) => {
  const [open, setOpen] = useState(false);
  const toggleOpen = () => {
    setOpen(!open);
  };

  return (
    <>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell width={12}>
          <IconButton aria-label="expand row" size="small" onClick={toggleOpen}>
            {open ? <KeyboardArrowRight /> : <KeyboardArrowDown />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ whiteSpace: 'nowrap' }}>{row.timestamp}</TableCell>

        {fields.length === 0 ? (
          <RowPreview row={row} />
        ) : (
          fields.map((field) => (
            <TableCell key={field}>
              <Typography sx={{ wordBreak: 'break-all' }}>{row[field]}</Typography>
            </TableCell>
          ))
        )}
        <TableCell width={20}>
          <Tooltip title="Download document">
            <IconButton
              onClick={() => {
                fileDownload(
                  JSON.stringify(row, null, 2),
                  `${row['timestamp']}__${row['container_name']}__${row['pod_name']}__${row['namespace']}__${row['cluster']}.json`,
                );
              }}
            >
              <Download fontSize="small" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>
      {open && <DocumentDetails handlers={handlers} row={row} options={options} />}
    </>
  );
};

export interface ILogsTableHandlers {
  onAddFilter: (filter: string) => void;
  onChangeSort: (order: string) => void;
  onSelectField: (field: string) => void;
}

export interface ILogsTableOptions {
  hideActionColumn: boolean;
}

interface ILogsTable {
  fields: string[];
  handlers: ILogsTableHandlers;
  options: ILogsTableOptions;
  order: 'asc' | 'desc';
  orderBy: string;
  rows: IRow[];
}

/**
 * LogsTable renders a table for the given rows and fields
 * - sort order can be defined via order and orderBy
 * - when fields are given, the table renders each field in a column
 * - when no fields are given the table renders every row in a preview format
 * - handlers contain actions that could be triggered from viewing a single log document
 *   (e.g. adding a filter to the query, changing the sort order or selecting a field)
 */
const LogsTable: FunctionComponent<ILogsTable> = ({
  fields: selectedFields,
  order,
  orderBy,
  rows,
  handlers,
  options,
}) => {
  const fields = selectedFields.length > 0 ? ['timestamp', ...selectedFields] : ['timestamp', 'log'];

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell />
            {fields.map((field) => (
              <TableCell key={field} sx={{ verticalAlign: 'top' }}>
                <TableSortLabel
                  onClick={() => handlers.onChangeSort(field)}
                  active={orderBy === field}
                  direction={orderBy === field ? order : 'asc'}
                >
                  {field}
                </TableSortLabel>
              </TableCell>
            ))}
            <TableCell />
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, i) => (
            <LogRow key={i} fields={selectedFields} row={row} handlers={handlers} options={options} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
  return <></>;
};

export default LogsTable;
