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
  Tabs,
  Theme,
  Tooltip,
  Typography,
  useTheme,
} from '@mui/material';
import { FunctionComponent, MouseEvent, useRef } from 'react';
import { useState } from 'react';
import { VictoryAxis, VictoryBar, VictoryChart, VictoryThemeDefinition, createContainer } from 'victory';

import { IBucket, IDataView, ILogsData } from '../utils/utils';

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

/**
 * `getProperty` returns the property of an object for a given key.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getProperty = (document: any, key: string): string | number => {
  return key.split('.').reduce((o, x) => {
    return typeof o == 'undefined' || o === null ? o : o[x];
  }, document);
};

// getKeyValues creates an array with all keys and values of the document.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getKeyValues = (obj: any, prefix = ''): { key: string; value: string }[] => {
  return Object.keys(obj).reduce((res: { key: string; value: string }[], el) => {
    if (Array.isArray(obj[el])) {
      return res;
    } else if (typeof obj[el] === 'object' && obj[el] !== null) {
      return [...res, ...getKeyValues(obj[el], prefix + el + '.')];
    }
    return [...res, { key: prefix + el, value: obj[el] }];
  }, []);
};

/**
 * LogsDownload renders two action items for downloading all rows in either JSON or CSV format
 */
export const LogsDownload: FunctionComponent<{
  dataView: IDataView;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  documents: Record<string, any>[];
  download: (data: string, filename: string) => void;
  fields: string[];
}> = ({ documents, dataView, fields, download }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleOpen = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * `downloadJSON` lets a user download the returned documents as raw logs.
   */
  const downloadJSON = () => {
    download(JSON.stringify(documents), 'kobs-elasticsearch-export.json');
  };

  /**
   * `downloadCSV` lets a user donwload the returned documents as csv file, with the selected fields as columns.
   */
  const downloadCSV = () => {
    let csv = '';

    for (const document of documents) {
      if (dataView.timestampField) {
        csv = csv + formatTimeString(document['_source'][dataView.timestampField ?? '']);
      }

      for (const field of fields) {
        csv = csv + ';' + (getProperty(document['_source'], field) ?? '');
      }

      csv = csv + '\r\n';
    }

    download(csv, 'kobs-elasticsearch-export.csv');
  };

  return (
    <>
      <IconButton size="small" onClick={handleOpen} aria-label="open menu">
        <MoreVert />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={downloadJSON} aria-label="Download JSON">
          <ListItemIcon>
            <Download fontSize="small" />
          </ListItemIcon>
          <ListItemText>Download JSON</ListItemText>
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

const DocumentDetailsTable: FunctionComponent<{
  addFilter?: (filter: string) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  document: Record<string, any>;
  selectField?: (field: string) => void;
}> = ({ document, selectField, addFilter }) => {
  const fields = getKeyValues(document['_source']);

  return (
    <Box sx={{ margin: 1 }}>
      <Table size="small" aria-label="document view">
        <TableBody>
          {fields.map((field) => {
            const isNumber = typeof field.value === 'number';

            return (
              <TableRow
                key={field.key}
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
                      <Tooltip
                        title={
                          isNumber
                            ? `add filter: AND ${field.key}: ${field.value}`
                            : `add filter: AND ${field.key}: "${field.value}"`
                        }
                      >
                        <IconButton
                          aria-label="add EQ field filter"
                          size="small"
                          onClick={() =>
                            addFilter(
                              isNumber ? `AND ${field.key}: ${field.value}` : `AND ${field.key}: "${field.value}"`,
                            )
                          }
                        >
                          <ZoomIn sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip
                        title={
                          isNumber
                            ? `add filter: AND NOT ${field.key}: ${field.value}`
                            : `add filter: AND NOT ${field.key}: "${field.value}"`
                        }
                      >
                        <IconButton
                          aria-label="add EQ field filter"
                          size="small"
                          onClick={() =>
                            addFilter(
                              isNumber
                                ? `AND NOT ${field.key}: ${field.value}`
                                : `AND NOT ${field.key}: "${field.value}"`,
                            )
                          }
                        >
                          <ZoomOut sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={`add filter: AND _exists_: ${field.key}`}>
                        <IconButton
                          aria-label="add EXISTS field filter"
                          size="small"
                          onClick={() => addFilter(`AND _exists_: ${field.key}`)}
                        >
                          <SavedSearch sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title={`toggle column ${field.key}`}>
                        <IconButton
                          aria-label="toggle field column"
                          size="small"
                          onClick={() => selectField(field.key)}
                        >
                          <TableChart sx={{ fontSize: 16 }} />
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                )}
                <TableCell width="25%">
                  <Typography sx={{ wordBreak: 'break-all' }}>{field.key}</Typography>
                </TableCell>
                <TableCell>
                  <Typography sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{field.value}</Typography>
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
  dataView: IDataView;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  document: Record<string, any>;
  selectField?: (field: string) => void;
  selectedFields: string[];
}> = ({ document, dataView, selectedFields, selectField, addFilter }) => {
  const [activeTab, setActiveTab] = useState<string>('table');

  return (
    <TableRow>
      <TableCell />
      <TableCell
        colSpan={
          dataView.timestampField
            ? selectedFields.length === 0
              ? 2
              : selectedFields.length + 1
            : selectedFields.length === 0
              ? 1
              : selectedFields.length
        }
      >
        <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tabs value={activeTab} onChange={(_, value) => setActiveTab(value)}>
            <Tab label="Table" value="table" aria-controls="tab-panel-json" />
            <Tab label="JSON" value="json" aria-controls="tab-panel-table" />
          </Tabs>
        </Box>

        <Box hidden={activeTab !== 'table'} py={6}>
          {activeTab === 'table' && (
            <DocumentDetailsTable document={document} selectField={selectField} addFilter={addFilter} />
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
 * The `DocumentPreview` renders a preview of a log line / document with the most important columns.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const DocumentPreview: FunctionComponent<{ document: Record<string, any> }> = ({ document }) => {
  const theme = useTheme();
  const fields = getKeyValues(document['_source']);

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
      {fields.map((field) => (
        <span key={field.key} style={{ paddingBottom: '8px', paddingRight: '8px' }}>
          <span
            style={{
              backgroundColor: theme.palette.action.selected,
              borderRadius: '6px',
              padding: '4px',
              wordBreak: 'break-all',
            }}
          >
            {field.key}:
          </span>
          <span style={{ padding: '4px', wordBreak: 'break-all' }}>{field.value}</span>
        </span>
      ))}
    </Typography>
  );
};

/**
 * The `Document` component renders a single document in the table of documents. It uses the `selectedFields` to render
 * each table cell or if no fields are selected, it renders a preview of the document via the `DocumentPreview`
 * component.
 */
const Document: FunctionComponent<{
  addFilter?: (filter: string) => void;
  dataView: IDataView;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  document: Record<string, any>;
  selectField?: (field: string) => void;
  selectedFields: string[];
}> = ({ document, dataView, selectedFields, selectField, addFilter }) => {
  const [open, setOpen] = useState<boolean>(false);

  return (
    <>
      <TableRow sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
        <TableCell>
          <IconButton aria-label="expand document" size="small" onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowDown /> : <KeyboardArrowRight />}
          </IconButton>
        </TableCell>

        {dataView.timestampField ? (
          <>
            <TableCell sx={{ whiteSpace: 'nowrap' }}>
              {document['_source'][dataView.timestampField ?? '']
                ? formatTimeString(document['_source'][dataView.timestampField ?? ''])
                : '-'}
            </TableCell>

            {selectedFields.length === 0 ? (
              <TableCell>
                <DocumentPreview document={document} />
              </TableCell>
            ) : (
              selectedFields.map((field) => (
                <TableCell key={field}>
                  <Typography sx={{ wordBreak: 'break-all' }}>{getProperty(document['_source'], field)}</Typography>
                </TableCell>
              ))
            )}
          </>
        ) : (
          <>
            {selectedFields.length === 0 ? (
              <TableCell>
                <DocumentPreview document={document} />
              </TableCell>
            ) : (
              selectedFields.map((field) => (
                <TableCell key={field}>
                  <Typography sx={{ wordBreak: 'break-all' }}>{getProperty(document['_source'], field)}</Typography>
                </TableCell>
              ))
            )}
          </>
        )}

        <TableCell>
          <Tooltip title="Download Document">
            <IconButton
              onClick={() => {
                fileDownload(JSON.stringify(document, null, 2), `${document['_id']}__${document['_index']}.json`);
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
          dataView={dataView}
          selectedFields={selectedFields}
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
  dataView: IDataView;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  documents: Record<string, any>[];
  selectField?: (field: string) => void;
  selectedFields: string[];
}> = ({ selectedFields, dataView, documents, selectField, addFilter }) => {
  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell width={20} />

            {dataView.timestampField ? (
              <>
                {selectedFields.length === 0 ? (
                  <>
                    <TableCell>Time</TableCell>
                    <TableCell>Document</TableCell>
                  </>
                ) : (
                  <>
                    <TableCell>Time</TableCell>
                    {selectedFields.map((field) => (
                      <TableCell key={field}>{field}</TableCell>
                    ))}
                  </>
                )}
              </>
            ) : (
              <>
                {selectedFields.length === 0 ? (
                  <>
                    <TableCell>Document</TableCell>
                  </>
                ) : (
                  <>
                    {selectedFields.map((field) => (
                      <TableCell key={field}>{field}</TableCell>
                    ))}
                  </>
                )}
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
              dataView={dataView}
              selectedFields={selectedFields}
              selectField={selectField}
              addFilter={addFilter}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

/**
 * The `LogsChart` component renders a bar chart for the provided buckets, so that a user gets a fast idea how the
 * returned logs are distributed in the selected time range. The chart can also be used to adjust the selected time
 * range.
 */
const LogsChart: FunctionComponent<{
  buckets: IBucket[];
  setTimes: (times: ITimes) => void;
}> = ({ buckets, setTimes }) => {
  const theme = useTheme();
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);

  const data = buckets.map((bucket) => ({
    x: new Date(bucket.key),
    y: bucket.doc_count,
  }));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const BrushVoronoiContainer: any = createContainer('voronoi', 'brush');

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
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onBrushDomainChangeEnd={(domain: any) => {
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
      >
        <VictoryAxis dependentAxis={false} tickFormat={chartTickFormatTime} />
        <VictoryBar data={data} name="count" barWidth={data && chartSize.width / data.length - 4} />
      </VictoryChart>
    </Box>
  );
};

export const Logs: FunctionComponent<{
  addFilter?: (filter: string) => void;
  data?: ILogsData;
  dataView: IDataView;
  page: number;
  perPage: number;
  selectField?: (field: string) => void;
  selectedFields: string[];
  setPage: (page: number, perPage: number) => void;
  setTimes: (times: ITimes) => void;
  showChart: boolean;
}> = ({ data, dataView, selectedFields, page, perPage, setPage, selectField, showChart, setTimes, addFilter }) => {
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
            <Typography fontWeight="bold">{`${data?.hits} Documents in ${data?.took} Milliseconds`}</Typography>
            {data?.documents && (
              <LogsDownload
                documents={data.documents}
                dataView={dataView}
                fields={selectedFields}
                download={fileDownload}
              />
            )}
          </Stack>
          {dataView.timestampField && (
            <Box sx={{ height: '250px' }} p={4}>
              <LogsChart buckets={data?.buckets || []} setTimes={setTimes} />
            </Box>
          )}
        </Card>
      )}

      <Card>
        <Documents
          documents={data?.documents?.slice((page - 1) * perPage, page * perPage) ?? []}
          dataView={dataView}
          selectedFields={selectedFields}
          selectField={selectField}
          addFilter={addFilter}
        />
      </Card>

      <Pagination count={data?.documents?.length ?? 0} page={page} perPage={perPage} handleChange={setPage} />
    </Stack>
  );
};
