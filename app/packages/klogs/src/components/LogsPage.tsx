import { Completion, autocompletion, completeFromList } from '@codemirror/autocomplete';
import {
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
  pluginBasePath,
  Toolbar,
  ToolbarItem,
  TTime,
  useQueryState,
  UseQueryWrapper,
} from '@kobsio/core';
import { ArrowDownward, ArrowUpward, ContentCopy, Delete, MoreVert } from '@mui/icons-material';
import {
  Box,
  Card,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, MouseEvent, useContext, useEffect } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Logs } from './Logs';

import { description, ILogsData } from '../utils/utils';

interface IOptions {
  fields: string[];
  order: 'ascending' | 'descending';
  orderBy: string;
  page: number;
  perPage: number;
  query: string;
  time: TTime;
  timeEnd: number;
  timeStart: number;
}

const LogsActions: FunctionComponent<{ instance: IPluginInstance; options: IOptions }> = ({ instance, options }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <IconButton size="small" onClick={handleOpen} aria-label="open menu">
        <MoreVert />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem
          component={Link}
          to={`${pluginBasePath(instance)}/aggregation?query=${encodeURIComponent(options.query)}&time=${
            options.time
          }&timeStart=${options.timeStart}&timeEnd=${options.timeEnd}`}
        >
          <ListItemText>Aggregation</ListItemText>
        </MenuItem>

        <MenuItem component="a" href="https://kobs.io/main/plugins/klogs/" target="_blank">
          <ListItemText>Documentation</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
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
            '&:hover .kobsio-klogs-fields-action-items': { opacity: 1 },
          }}
        >
          <ListItemButton sx={{ cursor: 'inherit' }}>
            <ListItemText primary={field} />
            <Stack className="kobsio-klogs-fields-action-items" direction="row" sx={{ opacity: 0 }}>
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
          label="Filter Fields"
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
  instance: IPluginInstance;
  options: IOptions;
  setOptions: (options: IOptions) => void;
}> = ({ instance, options, setOptions }) => {
  const [query, setQuery] = useState<string>(options.query);
  const apiContext = useContext<IAPIContext>(APIContext);

  const { data } = useQuery<Completion[], APIError>(['klogs/fields', instance], async () => {
    const defaultCompletions: Completion[] = [
      { info: 'equals', label: '=', type: 'keyword' },
      { info: 'not equals', label: '!=', type: 'keyword' },
      { info: 'smaller', label: '<', type: 'keyword' },
      { info: 'smaller or equal', label: '<=', type: 'keyword' },
      { info: 'greater', label: '>', type: 'keyword' },
      { info: 'greater or equal', label: '>=', type: 'keyword' },
      { info: 'ILIKE', label: '=~', type: 'keyword' },
      { info: 'not ILIKE', label: '!~', type: 'keyword' },
      { info: 'regex match', label: '~', type: 'keyword' },

      { info: 'and statement', label: '_and_', type: 'keyword' },
      { info: 'or statement', label: '_or_', type: 'keyword' },
      { info: 'not statement', label: '_not_', type: 'keyword' },
      { info: 'exists statement', label: '_exists_', type: 'keyword' },
    ];

    try {
      const fields = await apiContext.client.get<string[]>(`/api/plugins/klogs/fields`, {
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
      return [
        ...defaultCompletions,
        ...fields.filter((field) => !field.includes(' ')).map((field) => ({ label: field, type: 'keyword' })),
      ];
    } catch {
      return defaultCompletions;
    }
  });

  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined) => {
    if (additionalFields && additionalFields.length === 2) {
      setOptions({
        ...options,
        ...times,
        order: additionalFields[1].value === 'ascending' ? 'ascending' : 'descending',
        orderBy: additionalFields[0].value,
        query: query,
      });
    }
  };

  const handleSubmit = () => {
    setOptions({ ...options, query: query });
  };

  useEffect(() => {
    setQuery(options.query);
  }, [options.query]);

  return (
    <Toolbar>
      <ToolbarItem grow={true}>
        {data && (
          <Editor
            language={[
              autocompletion({
                override: [completeFromList(data)],
              }),
            ]}
            minimal={true}
            value={query}
            onChange={(value) => setQuery(value)}
            handleSubmit={handleSubmit}
          />
        )}
      </ToolbarItem>
      <ToolbarItem align="right">
        <Options
          additionalFields={[
            {
              label: 'Order By',
              name: 'orderBy',
              placeholder: 'timestamp',
              value: options.orderBy || '',
            },
            {
              label: 'Order',
              name: 'order',
              placeholder: '',
              type: 'select',
              value: options.order,
              values: ['ascending', 'descending'],
            },
          ]}
          times={options}
          showOptions={true}
          showSearchButton={true}
          setOptions={changeOptions}
        />
      </ToolbarItem>
    </Toolbar>
  );
};

/**
 * LogsPage displays the klogs plugin page that allows the user to search for logs and compose a table with custom
 * columns for the returned logs.
 */
const LogsPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  const theme = useTheme();
  const isLgUp = useMediaQuery(theme.breakpoints.up('lg'));
  const apiContext = useContext<IAPIContext>(APIContext);

  const [options, setOptions] = useQueryState<IOptions>({
    fields: [],
    order: 'descending',
    orderBy: 'timestamp',
    page: 1,
    perPage: 100,
    query: '',
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
  });

  const { isError, isLoading, error, data, refetch } = useQuery<ILogsData, APIError>(
    ['klogs/logs', options.query, options.order, options.orderBy, options.timeStart, options.timeEnd],
    () => {
      const path = `/api/plugins/klogs/logs?query=${encodeURIComponent(options.query)}&order=${
        options.order
      }&orderBy=${encodeURIComponent(options.orderBy)}&timeStart=${options.timeStart}&timeEnd=${options.timeEnd}`;

      return apiContext.client.get<ILogsData>(path, {
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
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
    setOptions({ ...options, ...times });
  };

  /**
   * `addFilter` adds the given filter as string to the query, so that it can be used to filter down an existing query.
   */
  const addFilter = (filter: string) => {
    setOptions({ ...options, query: `${options.query} ${filter}` });
  };

  /**
   * `changeOrder` changes the order parameters for a query, to the provided `order` and `orderBy` values.
   */
  const changeOrder = (orderBy: string): void => {
    const isAscending = options.orderBy === orderBy && options.order === 'ascending';
    setOptions({ ...options, order: isAscending ? 'descending' : 'ascending', orderBy: orderBy });
  };

  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
      toolbar={<LogsToolbar instance={instance} options={options} setOptions={setOptions} />}
      actions={<LogsActions instance={instance} options={options} />}
    >
      <UseQueryWrapper
        error={error}
        isError={isError}
        isLoading={isLoading}
        refetch={refetch}
        errorTitle="Failed to get logs"
        isNoData={!data || !data.documents || data.documents.length === 0}
        noDataTitle="No logs were found"
        noDataMessage="No logs were found for the provided query in the provided time range."
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

          <Logs
            data={data}
            selectedFields={options.fields}
            selectField={selectField}
            addFilter={addFilter}
            changeOrder={changeOrder}
            order={options.order}
            orderBy={options.orderBy}
            page={options.page}
            perPage={options.perPage}
            setPage={(page, perPage) => setOptions({ ...options, page: page, perPage: perPage })}
            showChart={true}
            setTimes={setTimes}
          />
        </Stack>
      </UseQueryWrapper>
    </Page>
  );
};

export default LogsPage;
