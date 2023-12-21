import {
  chartTheme,
  chartTickFormatTime,
  ChartTooltip,
  Editor,
  fileDownload,
  formatTime,
  formatTimeString,
  ITimes,
  Pagination,
  useDimensions,
} from '@kobsio/core';
import {
  Download,
  KeyboardArrowDown,
  KeyboardArrowRight,
  ListAlt,
  MoreVert,
  RemoveCircleOutline,
  SavedSearch,
  TableChart,
  ZoomIn,
  ZoomOut,
} from '@mui/icons-material';
import {
  Box,
  Card,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tabs,
  Theme,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { FunctionComponent, MouseEvent, useRef } from 'react';
import { useState } from 'react';
import {
  VictoryAxis,
  VictoryBar,
  VictoryBrushContainerProps,
  VictoryChart,
  VictoryThemeDefinition,
  VictoryVoronoiContainerProps,
  createContainer,
} from 'victory';

import { ILogsData } from '../utils/utils';

/**
 * `chartThemeFromBaseTheme` is a utility function to create a custom theme for the `LogsChart` based on the chart theme
 * returned from the `chartTheme` function from the core package.
 */
const chartThemeFromBaseTheme = (muiTheme: Theme, base: VictoryThemeDefinition): VictoryThemeDefinition => {
  return {
    ...base,
    axis: {
      ...base.axis,
      style: {
        ...base.axis?.style,
        grid: { stroke: 'transparent' },
        tickLabels: {
          ...base.axis?.style?.tickLabels,
          padding: 2,
        },
      },
    },
    bar: {
      style: {
        data: {
          fill: muiTheme.palette.primary.main,
          stroke: 0,
        },
      },
    },
  };
};

const isNumberField = (field: string, fields: { name: string; type: string }[]): boolean => {
  if (fields.filter((f) => f.name === field && f.type === 'number').length > 0) {
    return true;
  }

  return false;
};

/**
 * The `LogsChart` component renders a bar chart for the provided buckets, so that a user gets a fast idea how the
 * returned logs are distributed in the selected time range. The chart can also be used to adjust the selected time
 * range.
 */
const LogsChart: FunctionComponent<{
  buckets: {
    count: number;
    interval: number;
  }[];
  setTimes: (times: ITimes) => void;
}> = ({ buckets, setTimes }) => {
  const theme = useTheme();
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);

  const data = buckets.map((bucket) => ({
    x: new Date(bucket.interval * 1000),
    y: bucket.count,
  }));

  const BrushVoronoiContainer = createContainer<VictoryVoronoiContainerProps, VictoryBrushContainerProps>(
    'voronoi',
    'brush',
  );

  return (
    <Box sx={{ height: '100%', width: '100%' }} ref={refChart}>
      <VictoryChart
        containerComponent={
          <BrushVoronoiContainer
            brushDimension="x"
            labels={() => ' '}
            labelComponent={
              <ChartTooltip
                height={chartSize.height}
                width={chartSize.width}
                legendData={({ datum }: { datum: { x: Date; y: number } }) => ({
                  color: theme.palette.primary.main,
                  label: 'Documents',
                  title: formatTime(datum.x),
                  value: datum.y ?? 'N/A',
                })}
              />
            }
            mouseFollowTooltips={true}
            defaultBrushArea="none"
            brushDomain={{ x: [0, 0] }}
            voronoiPadding={0}
            onBrushDomainChangeEnd={(domain) => {
              if (domain.x.length === 2) {
                setTimes({
                  time: 'custom',
                  timeEnd: Math.floor((domain.x[1] as Date).getTime() / 1000),
                  timeStart: Math.floor((domain.x[0] as Date).getTime() / 1000),
                });
              }
            }}
          />
        }
        padding={{ bottom: 25, left: 0, right: 0, top: 0 }}
        scale={{ x: 'time', y: 'linear' }}
        theme={chartThemeFromBaseTheme(theme, chartTheme(theme))}
        width={chartSize.width}
        height={chartSize.height}
        domain={{ x: [new Date(buckets[0].interval * 1000), new Date(buckets[buckets.length - 1].interval * 1000)] }}
      >
        <VictoryAxis dependentAxis={false} tickFormat={chartTickFormatTime} />
        <VictoryBar data={data} name="count" barWidth={data && chartSize.width / data.length - 4} />
      </VictoryChart>
    </Box>
  );
};

/**
 * LogsDownload renders two action items for downloading all rows in either JSON or CSV format
 */
export const LogsDownload: FunctionComponent<{
  documents: Record<string, string>[];
  download: (data: string, filename: string) => void;
  fields: string[];
}> = ({ documents, fields, download }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleOpen = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * `downloadLogs` lets a user download the returned documents as raw logs.
   */
  const downloadLogs = () => {
    let log = '';

    for (const document of documents) {
      log = log + document['log'];
    }

    download(log, 'kobs-export-logs.log');
  };

  /**
   * `downloadCSV` lets a user donwload the returned documents as csv file, with the selected fields as columns.
   */
  const downloadCSV = () => {
    if (!documents || fields.length === 0) {
      return;
    }
    let csv = '';

    for (const document of documents) {
      csv = csv + formatTimeString(document['timestamp']);

      for (const field of fields) {
        csv = csv + ';' + (field in document ? document[field] : '-');
      }

      csv = csv + '\r\n';
    }

    download(csv, 'kobs-export-logs.csv');
  };

  return (
    <>
      <IconButton size="small" onClick={handleOpen} aria-label="open menu">
        <MoreVert />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={downloadLogs} aria-label="Download Logs">
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download Logs</ListItemText>
        </MenuItem>

        <MenuItem onClick={downloadCSV} disabled={fields.length === 0} aria-label="Download CSV">
          <ListItemIcon>
            <ListAlt fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download CSV</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

/**
 * The `DocumentPreview` renders a preview of a log line / document with the most important columns.
 */
const DocumentPreview: FunctionComponent<{ document: Record<string, string> }> = ({ document }) => {
  const theme = useTheme();
  const knownColumns = ['cluster', 'namespace', 'app', 'pod_name', 'container_name', 'host'];
  const contentColumns = Object.keys(document).filter(
    (key) => key.startsWith('content_') && document[key].length < 128,
  );
  const kubernetesColumns = Object.keys(document).filter(
    (key) => key.startsWith('kubernetes_') && document[key].length < 128,
  );

  return (
    <Typography
      lineHeight={2}
      sx={{
        WebkitBoxOrient: 'vertical',
        WebkitLineClamp: 4,
        display: '-webkit-box',
        lineHeight: '30px',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {[...knownColumns, ...contentColumns, ...kubernetesColumns].map((key) => (
        <span key={key} style={{ paddingBottom: '8px', paddingRight: '8px' }}>
          <span
            style={{
              backgroundColor: theme.palette.action.selected,
              borderRadius: '6px',
              padding: '4px',
              wordBreak: 'break-all',
            }}
          >
            {key}:
          </span>
          <span style={{ padding: '4px', wordBreak: 'break-all' }}>{document[key]}</span>
        </span>
      ))}
    </Typography>
  );
};

const DocumentDetailsTable: FunctionComponent<{
  addFilter?: (filter: string) => void;
  document: Record<string, string>;
  fields: { name: string; type: string }[];
  selectField?: (field: string) => void;
}> = ({ document, fields, selectField, addFilter }) => {
  return (
    <Box sx={{ margin: 1 }}>
      <Table size="small" aria-label="document view">
        <TableBody>
          {Object.entries(document).map(([key, value]) => {
            const isNumber = isNumberField(key, fields);

            return (
              <TableRow
                key={key}
                sx={{
                  '&:hover .row-action-icons': { opacity: 1 },
                }}
              >
                {addFilter && selectField && (
                  <TableCell component="th" scope="row">
                    <Stack
                      className="row-action-icons"
                      direction="row"
                      sx={{
                        opacity: 0,
                      }}
                    >
                      <Tooltip title={isNumber ? `add filter: ${key} = ${value}` : `add filter: ${key} = '${value}'`}>
                        <IconButton
                          aria-label="add EQ field filter"
                          size="small"
                          onClick={() => addFilter(isNumber ? `_and_ ${key} = ${value}` : `_and_ ${key} = '${value}'`)}
                        >
                          <ZoomIn sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title={isNumber ? `add filter: ${key} != ${value}` : `add filter: ${key} != '${value}'`}>
                        <IconButton
                          aria-label="add NEQ field filter"
                          size="small"
                          onClick={() =>
                            addFilter(isNumber ? `_and_ ${key} != ${value}` : `_and_ ${key} != '${value}'`)
                          }
                        >
                          <ZoomOut sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={`add filter: _exists_ ${key}`}>
                        <IconButton
                          aria-label="add EXISTS field filter"
                          size="small"
                          onClick={() => addFilter(`_exists_ ${key}`)}
                        >
                          <SavedSearch sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>

                      {key !== 'timestamp' && (
                        <Tooltip title={`toggle column ${key}`}>
                          <IconButton aria-label="toggle field column" size="small" onClick={() => selectField(key)}>
                            <TableChart sx={{ fontSize: 16 }} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                )}
                <TableCell width="25%">
                  <Typography sx={{ wordBreak: 'break-all' }}>{key}</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{value}</Typography>
                </TableCell>
                <TableCell />
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </Box>
  );
};

const DocumentDetails: FunctionComponent<{
  addFilter?: (filter: string) => void;
  document: Record<string, string>;
  fields: { name: string; type: string }[];
  selectField?: (field: string) => void;
  selectedFields: string[];
}> = ({ document, selectedFields, fields, selectField, addFilter }) => {
  const [activeTab, setActiveTab] = useState<string>('table');

  return (
    <TableRow>
      <TableCell />
      <TableCell colSpan={selectedFields.length === 0 ? 2 : selectedFields.length + 1}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
            <Tab label="Table" value="table" aria-controls="tab-panel-json" />
            <Tab label="JSON" value="json" aria-controls="tab-panel-table" />
          </Tabs>
        </Box>

        <Box hidden={activeTab !== 'table'} py={6}>
          {activeTab === 'table' && (
            <DocumentDetailsTable document={document} fields={fields} selectField={selectField} addFilter={addFilter} />
          )}
        </Box>

        <Box hidden={activeTab !== 'json'} py={6}>
          {activeTab === 'json' && <Editor language="json" readOnly={true} value={JSON.stringify(document, null, 2)} />}
        </Box>
      </TableCell>
      <TableCell />
    </TableRow>
  );
};

/**
 * The `Document` component renders a single document in the table of documents. It uses the `selectedFields` to render
 * each table cell or if no fields are selected, it renders a preview of the document via the `DocumentPreview`
 * component.
 */
const Document: FunctionComponent<{
  addFilter?: (filter: string) => void;
  document: Record<string, string>;
  fields: { name: string; type: string }[];
  selectField?: (field: string) => void;
  selectedFields: string[];
}> = ({ document, selectedFields, fields, selectField, addFilter }) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
        <TableCell>
          <IconButton aria-label="expand document" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
          </IconButton>
        </TableCell>

        <TableCell sx={{ whiteSpace: 'nowrap' }}>{formatTimeString(document['timestamp'])}</TableCell>

        {selectedFields.length === 0 ? (
          <TableCell>
            <DocumentPreview document={document} />
          </TableCell>
        ) : (
          selectedFields.map((field) => (
            <TableCell key={field}>
              <Typography sx={{ wordBreak: 'break-all' }}>{field in document ? document[field] : '-'}</Typography>
            </TableCell>
          ))
        )}

        <TableCell>
          <Tooltip title="Download Document">
            <IconButton
              onClick={() => {
                fileDownload(
                  JSON.stringify(document, null, 2),
                  `${document['timestamp']}__${document['container_name']}__${document['pod_name']}__${document['namespace']}__${document['cluster']}.json`,
                );
              }}
            >
              <Download fontSize="small" />
            </IconButton>
          </Tooltip>
        </TableCell>
      </TableRow>

      {open && (
        <DocumentDetails
          document={document}
          selectedFields={selectedFields}
          fields={fields}
          selectField={selectField}
          addFilter={addFilter}
        />
      )}
    </>
  );
};

/**
 * The `Documents` component is used to render the documents in a table. The table will show the timestamp of each log
 * line and a preview of the most important fields. If the user select a list of fields these fields will be shown
 * insteand of the preview.
 */
const Documents: FunctionComponent<{
  addFilter?: (filter: string) => void;
  changeOrder?: (orderBy: string) => void;
  documents: Record<string, string>[];
  fields: { name: string; type: string }[];
  order: 'ascending' | 'descending';
  orderBy: string;
  selectField?: (field: string) => void;
  selectedFields: string[];
}> = ({ selectedFields, fields, order, orderBy, documents, addFilter, selectField, changeOrder }) => {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell width={20} />

            {selectedFields.length === 0 ? (
              <>
                <TableCell>Time</TableCell>
                <TableCell>Log</TableCell>
              </>
            ) : (
              <>
                <TableCell>
                  <TableSortLabel
                    onClick={changeOrder ? () => changeOrder('timestamp') : undefined}
                    active={changeOrder ? orderBy === 'timestamp' : false}
                    direction={order === 'descending' ? 'desc' : 'asc'}
                  >
                    Time
                  </TableSortLabel>
                </TableCell>
                {selectedFields.map((field) => (
                  <TableCell key={field}>
                    <TableSortLabel
                      onClick={changeOrder ? () => changeOrder(field) : undefined}
                      active={changeOrder ? orderBy === field : false}
                      direction={order === 'descending' ? 'desc' : 'asc'}
                    >
                      {field}
                    </TableSortLabel>
                    <IconButton
                      edge="end"
                      color="inherit"
                      size={"small"}
                      sx={{ m: 0 }}
                      onClick={() => selectField?.(field)}
                    >
                      <RemoveCircleOutline fontSize="small"/>
                    </IconButton>
                  </TableCell>
                ))}
              </>
            )}

            <TableCell width={20} />
          </TableRow>
        </TableHead>
        <TableBody>
          {documents.map((document, index) => (
            <Document
              key={index}
              document={document}
              selectedFields={selectedFields}
              fields={fields}
              selectField={selectField}
              addFilter={addFilter}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export const Logs: FunctionComponent<{
  addFilter?: (filter: string) => void;
  changeOrder?: (orderBy: string) => void;
  data?: ILogsData;
  order: 'ascending' | 'descending';
  orderBy: string;
  page: number;
  perPage: number;
  selectField?: (field: string) => void;
  selectedFields: string[];
  setPage: (page: number, perPage: number) => void;
  setTimes: (times: ITimes) => void;
  showChart: boolean;
}> = ({
  data,
  selectedFields,
  page,
  perPage,
  setPage,
  showChart,
  setTimes,
  order,
  orderBy,
  addFilter,
  selectField,
  changeOrder,
}) => {
  return (
    <Stack
      direction="column"
      sx={{
        '&::-webkit-scrollbar': {
          display: 'none',
        },
        overflowX: 'auto',
        width: '100%',
      }}
    >
      {showChart && (
        <Card sx={{ mb: 6 }}>
          <Stack direction="row" justifyContent="space-between" p={4}>
            <Typography fontWeight="bold">{`${data?.count} Documents in ${data?.took} Milliseconds`}</Typography>
            {data?.documents && (
              <LogsDownload documents={data.documents} fields={selectedFields} download={fileDownload} />
            )}
          </Stack>
          <Box sx={{ height: '250px' }} p={4}>
            <LogsChart buckets={data?.buckets || []} setTimes={setTimes} />
          </Box>
        </Card>
      )}

      <Card>
        <Documents
          documents={data?.documents?.slice((page - 1) * perPage, page * perPage) ?? []}
          selectedFields={selectedFields}
          fields={data?.fields ?? []}
          selectField={selectField}
          addFilter={addFilter}
          changeOrder={changeOrder}
          order={order}
          orderBy={orderBy}
        />
      </Card>

      <Pagination count={data?.documents?.length ?? 0} page={page} perPage={perPage} handleChange={setPage} />
    </Stack>
  );
};
