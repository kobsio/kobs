import {
  addStateHistoryItem,
  APIContext,
  APIError,
  Editor,
  IAPIContext,
  IOptionsAdditionalFields,
  IPluginInstance,
  IPluginPageProps,
  ITimes,
  Options,
  Page,
  Toolbar,
  ToolbarItem,
  TTime,
  useQueryState,
  UseQueryWrapper,
} from '@kobsio/core';
import { ArrowDownward, ArrowUpward, ContentCopy, Delete } from '@mui/icons-material';
import {
  Autocomplete,
  Box,
  Card,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext, useEffect } from 'react';
import { useState } from 'react';

import { Logs } from './Logs';
import { QueryHistory } from './QueryHistory';

import { description, IDataView, ILogsData } from '../utils/utils';

interface IOptions {
  dataView: string;
  fields: string[];
  page: number;
  perPage: number;
  query: string;
  time: TTime;
  timeEnd: number;
  timeStart: number;
}

/**
 * `getFieldsRecursively` returns the fields for a single document as a list of string.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFieldsRecursively = (prefix: string, document: Record<string, any>): string[] => {
  const fields: string[] = [];
  for (const field in document) {
    if (typeof document[field] === 'object') {
      fields.push(...getFieldsRecursively(prefix ? `${prefix}.${field}` : field, document[field]));
    } else {
      fields.push(prefix ? `${prefix}.${field}` : field);
    }
  }

  return fields;
};

/**
 * `getFields` is used to get all fields as strings for the given documents. To get the fields we are looping over the
 * given documents and adding each field from this document. As a last step we have to remove all duplicated fields.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const getFields = (documents: Record<string, any>[]): string[] => {
  const fields: string[] = [];
  for (const document of documents) {
    fields.push(...getFieldsRecursively('', document['_source']));
  }

  const uniqueFields: string[] = [];
  for (const field of fields) {
    if (uniqueFields.indexOf(field) === -1) {
      uniqueFields.push(field);
    }
  }

  return uniqueFields;
};

/**
 * The `LogsFields` component renders a list of all the fields returned by a logs query and a list of fields selected by
 * the user. The component is also responsible for selecting fields and for changing the order of fields shown in the
 * logs table.
 */
export const LogsFields: FunctionComponent<{
  changeFieldOrder: (from: number, to: number) => void;
  fields: string[];
  selectField: (field: string) => void;
  selectedFields: string[];
}> = ({ fields, selectedFields, selectField, changeFieldOrder }) => {
  const [fieldsFilter, setFieldsFilter] = useState('');

  return (
    <List sx={{ wordBreak: 'break-all' }} dense={true} subheader={<li />}>
      {selectedFields.length > 0 && (
        <>
          <Typography fontWeight="bold" p={2}>
            Selected Fields
          </Typography>
          <Divider />
        </>
      )}
      {selectedFields.map((field, index) => (
        <ListItem
          key={field}
          disablePadding={true}
          aria-label={field}
          sx={{
            '&:hover .kobsio-elasticsearch-fields-action-items': { opacity: 1 },
          }}
        >
          <ListItemButton sx={{ cursor: 'inherit' }}>
            <ListItemText primary={field} />
            <Stack className="kobsio-elasticsearch-fields-action-items" direction="row" sx={{ opacity: 0 }}>
              <Tooltip title="move down">
                <IconButton
                  aria-label="move down"
                  sx={{ p: '2px' }}
                  size="small"
                  disabled={index === selectedFields.length - 1}
                  disableRipple={true}
                  onClick={() => {
                    changeFieldOrder(index, index + 1);
                  }}
                >
                  <ArrowDownward sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="move up">
                <IconButton
                  aria-label="move up"
                  sx={{ p: '2px' }}
                  size="small"
                  disabled={index === 0}
                  disableRipple={true}
                  onClick={() => {
                    changeFieldOrder(index - 1, index);
                  }}
                >
                  <ArrowUpward sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="copy">
                <IconButton
                  aria-label="copy"
                  sx={{ p: '2px' }}
                  size="small"
                  disableRipple={true}
                  onClick={() => {
                    navigator.clipboard.writeText(field);
                  }}
                >
                  <ContentCopy sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="delete">
                <IconButton
                  aria-label="delete"
                  disableRipple={true}
                  onClick={() => selectField(field)}
                  sx={{ p: '2px' }}
                  size="small"
                >
                  <Delete sx={{ fontSize: 14 }} />
                </IconButton>
              </Tooltip>
            </Stack>
          </ListItemButton>
        </ListItem>
      ))}
      <Typography fontWeight="bold" p={2}>
        Fields
      </Typography>
      <Divider />
      <Box p={2}>
        <TextField
          placeholder="Filter Fields"
          size="small"
          onChange={(e) => setFieldsFilter(e.target.value)}
          fullWidth={true}
        />
      </Box>
      {fields
        .filter((field) => field.includes(fieldsFilter))
        .map((field) => (
          <ListItem key={field} disablePadding={true}>
            <ListItemButton onClick={() => selectField(field)} aria-label={field}>
              <ListItemText primary={field} />
            </ListItemButton>
          </ListItem>
        ))}
    </List>
  );
};

/**
 * The `LogsToolbar` renders a text field which can be used by the user to provide a query and the `Options` component
 * where a user can select the time range for the logs which should be returned.
 */
const LogsToolbar: FunctionComponent<{
  dataViews: IDataView[];
  instance: IPluginInstance;
  options: IOptions;
  setOptions: (options: IOptions) => void;
}> = ({ instance, dataViews, options, setOptions }) => {
  const [query, setQuery] = useState<string>(options.query);

  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined) => {
    addStateHistoryItem('kobs-elasticsearch-queryhistory-logs', query);
    setOptions({
      ...options,
      ...times,
      page: 1,
      query: query,
    });
  };

  const handleSubmit = () => {
    addStateHistoryItem('kobs-elasticsearch-queryhistory-logs', query);
    setOptions({ ...options, page: 1, query: query });
  };

  useEffect(() => {
    setQuery(options.query);
  }, [options.query]);

  return (
    <Toolbar>
      <ToolbarItem width="200px">
        <Autocomplete
          size="small"
          multiple={false}
          disableCloseOnSelect={true}
          options={dataViews.map((dataView) => dataView.name) ?? []}
          getOptionLabel={(option) => option ?? ''}
          value={options.dataView}
          onChange={(e, value) => setOptions({ ...options, dataView: value ?? '' })}
          renderInput={(params) => <TextField {...params} label="Data View" placeholder="Data View" />}
        />
      </ToolbarItem>
      <ToolbarItem grow={true}>
        <Editor
          language="elasticsearch"
          minimal={true}
          value={query}
          onChange={(value) => setQuery(value)}
          handleSubmit={handleSubmit}
          adornment={
            <InputAdornment position="end">
              <QueryHistory
                historyKey="kobs-elasticsearch-queryhistory-logs"
                optionsQuery={options.query}
                setQuery={(query) => setQuery(query)}
              />
            </InputAdornment>
          }
        />
      </ToolbarItem>
      <ToolbarItem align="right">
        <Options times={options} showOptions={true} showSearchButton={true} setOptions={changeOptions} />
      </ToolbarItem>
    </Toolbar>
  );
};

/**
 * LogsPage displays the elasticsearch plugin page that allows the user to search for logs and compose a table with custom
 * columns for the returned logs.
 */
const LogsPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  const theme = useTheme();
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const apiContext = useContext<IAPIContext>(APIContext);
  const dataViews = instance.options?.dataViews ? (instance.options?.dataViews as IDataView[]) : [];

  const [options, setOptions] = useQueryState<IOptions>({
    dataView: dataViews.length > 0 && dataViews[0].name ? dataViews[0].name : '',
    fields: [],
    page: 1,
    perPage: 100,
    query: '*',
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
  });
  const dataView = dataViews.find((dataView: IDataView) => dataView.name === options.dataView);

  const { isError, isLoading, error, data, refetch } = useQuery<ILogsData, APIError>(
    ['elasticsearch/logs', options.dataView, options.query, options.timeStart, options.timeEnd],
    async () => {
      if (!dataView || !dataView.indexPattern) {
        throw new Error('Invalid data view');
      }

      const path = `/api/plugins/elasticsearch/logs?query=${encodeURIComponent(
        options.query,
      )}&indexPattern=${encodeURIComponent(dataView.indexPattern)}&timestampField=${encodeURIComponent(
        dataView.timestampField || '',
      )}&timeStart=${options.timeStart}&timeEnd=${options.timeEnd}`;

      const data = await apiContext.client.get<ILogsData>(path, {
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });

      return { ...data, fields: data.documents && getFields(data.documents) };
    },
  );

  /**
   * selectField is used to add a field as parameter, when it isn't present and to remove a fields from as parameter,
   *  when it is already present via the changeOptions function.
   */
  const selectField = (field: string) => {
    if (options) {
      let tmpFields: string[] = [];
      if (options.fields) {
        tmpFields = [...options.fields];
      }

      if (tmpFields.includes(field)) {
        tmpFields = tmpFields.filter((f) => f !== field);
      } else {
        tmpFields.push(field);
      }

      setOptions({ ...options, fields: tmpFields });
    }
  };

  /**
   * changeFieldOrder is used to change the order of an field by moving it from the `from` index to the `to` index.
   */
  const changeFieldOrder = (from: number, to: number) => {
    if (options && options.fields) {
      const tmpFields = [...options.fields];
      const tmpField = tmpFields[from];

      tmpFields[from] = tmpFields[to];
      tmpFields[to] = tmpField;

      setOptions({ ...options, fields: tmpFields });
    }
  };

  /**
   * `setTimes` changes the users selected time range to the provided `times`.
   */
  const setTimes = (times: ITimes) => {
    setOptions({ ...options, ...times, page: 1 });
  };

  /**
   * `addFilter` adds the given filter as string to the query, so that it can be used to filter down an existing query.
   */
  const addFilter = (filter: string) => {
    setOptions({ ...options, page: 1, query: `${options.query} ${filter}` });
  };

  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
      toolbar={<LogsToolbar instance={instance} dataViews={dataViews} options={options} setOptions={setOptions} />}
    >
      <UseQueryWrapper
        error={error}
        isError={isError}
        isLoading={isLoading}
        refetch={refetch}
        errorTitle="Failed to get documents"
        isNoData={!data || !data.documents || data.documents.length === 0}
        noDataTitle="No documents were found"
      >
        <Stack
          alignItems="flex-start"
          direction={isLgUp ? 'row' : 'column-reverse'}
          spacing={6}
          sx={{ maxWidth: '100%' }}
        >
          <Card sx={{ width: isLgUp ? '250px' : '100%' }}>
            <LogsFields
              selectedFields={options.fields}
              fields={data?.fields || []}
              selectField={selectField}
              changeFieldOrder={changeFieldOrder}
            />
          </Card>

          {dataView && (
            <Logs
              data={data}
              dataView={dataView}
              selectedFields={options.fields}
              selectField={selectField}
              addFilter={addFilter}
              page={options.page}
              perPage={options.perPage}
              setPage={(page, perPage) => setOptions({ ...options, page: page, perPage: perPage })}
              showChart={true}
              setTimes={setTimes}
            />
          )}
        </Stack>
      </UseQueryWrapper>
    </Page>
  );
};

export default LogsPage;
