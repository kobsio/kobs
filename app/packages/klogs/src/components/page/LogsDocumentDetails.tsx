import { Editor } from '@kobsio/core';
import { ZoomIn, ZoomOut, SavedSearch, TableChart } from '@mui/icons-material';
import { TableRow, TableCell, Tabs, Tab, Box, IconButton, Stack, Table, TableBody, Typography } from '@mui/material';
import { FunctionComponent, useState } from 'react';

import { ILogsTableHandlers, ILogsTableOptions } from './LogsTable';

import { IRow } from '../common/types';

interface IDocumentDetailsTableViewProps {
  handlers: ILogsTableHandlers;
  options: ILogsTableOptions;
  row: IRow;
}

/**
 * DocumentDetailsTableView renders a table that represents a log document
 */
const DocumentDetailsTableView: FunctionComponent<IDocumentDetailsTableViewProps> = ({ handlers, options, row }) => {
  return (
    <Box sx={{ margin: 1 }}>
      <Table size="small" aria-label="document view">
        <TableBody>
          {Object.entries(row).map(([key, value]) => (
            <TableRow
              key={key}
              sx={{
                '&:hover .row-action-icons': { opacity: 1 },
              }}
            >
              {!options.hideActionColumn && (
                <TableCell component="th" scope="row">
                  <Stack
                    className="row-action-icons"
                    direction="row"
                    sx={{
                      opacity: 0,
                    }}
                  >
                    <IconButton
                      aria-label="add EQ field filter"
                      size="small"
                      onClick={() => handlers.onAddFilter(`${key} = '${value}'`)}
                    >
                      <ZoomIn sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton
                      aria-label="add NEQ field filter"
                      size="small"
                      onClick={() => handlers.onAddFilter(`${key} != '${value}'`)}
                    >
                      <ZoomOut sx={{ fontSize: 16 }} />
                    </IconButton>
                    <IconButton
                      aria-label="add EXISTS field filter"
                      size="small"
                      onClick={() => handlers.onAddFilter(`_exists_ ${key}`)}
                    >
                      <SavedSearch sx={{ fontSize: 16 }} />
                    </IconButton>
                    {key !== 'timestamp' && (
                      <IconButton
                        aria-label="toggle field column"
                        size="small"
                        onClick={() => handlers.onSelectField(key)}
                      >
                        <TableChart sx={{ fontSize: 16 }} />
                      </IconButton>
                    )}
                  </Stack>
                </TableCell>
              )}
              <TableCell component="th" scope="row">
                {key}
              </TableCell>
              <TableCell>
                <Typography sx={{ wordBreak: 'break-all' }}>{value}</Typography>
              </TableCell>
              <TableCell />
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Box>
  );
};

interface IDocumentDetailsEditorViewProps {
  row: IRow;
}

/**
 * DocumentDetailsJSONView renders a JSON readonly editor for viewing a log document in JSON format
 */
const DocumentDetailsJSONView: FunctionComponent<IDocumentDetailsEditorViewProps> = ({ row }) => {
  const content = JSON.stringify(row, null, 2);
  const lines = content.split('\n').length;
  const height = lines * 20 - 26;

  return (
    <Box height={height} sx={{ maxWidth: 'calc(100vw - 600px)' }}>
      <Editor language="json" readOnly={true} value={content} />
    </Box>
  );
};

interface ITabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: FunctionComponent<ITabPanelProps> = ({ index, value, children }) => {
  return (
    <div role="tabpanel" hidden={value !== index} id={`tabpanel-${index}`} aria-labelledby={`tab-${index}`}>
      {value === index && children}
    </div>
  );
};

interface IDocumentDetailsProps {
  handlers: ILogsTableHandlers;
  options: ILogsTableOptions;
  row: IRow;
}

/**
 * DocumentDetails renders a detailed view of a single log document
 * the user can switch between a Table view and a JSON view of the document
 */
const DocumentDetails: FunctionComponent<IDocumentDetailsProps> = ({ row, handlers, options }) => {
  const [tab, setTab] = useState<0 | 1>(0);
  return (
    <TableRow sx={{ '& > *': { borderBottom: 'unset', borderTop: 'unset' } }}>
      <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
        <Tabs
          value={tab}
          onChange={(e, value: 0 | 1) => setTab(value)}
          aria-label="detailed log display variant"
          sx={{ mb: 2 }}
        >
          <Tab label="Table" id="table" aria-controls="tab-panel-json" />
          <Tab label="JSON" id="json" aria-controls="tab-panel-table" />
        </Tabs>
        <TabPanel index={0} value={tab}>
          <DocumentDetailsTableView row={row} handlers={handlers} options={options} />
        </TabPanel>
        <TabPanel index={1} value={tab}>
          <DocumentDetailsJSONView row={row} />
        </TabPanel>
      </TableCell>
    </TableRow>
  );
};

export default DocumentDetails;
