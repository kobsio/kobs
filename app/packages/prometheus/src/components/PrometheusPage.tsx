import {
  IOptionsAdditionalFields,
  IPluginPageProps,
  ITimes,
  Options,
  Page,
  Toolbar,
  ToolbarItem,
  useQueryState,
  IPluginInstance,
  IAPIContext,
  APIContext,
  APIError,
  UseQueryWrapper,
  getChartColor,
  getStateHistory,
  addStateHistoryItems,
  Editor,
  useLatest,
} from '@kobsio/core';
import { Add, ManageSearch, Remove } from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  Card,
  IconButton,
  InputAdornment,
  Menu,
  MenuItem,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, MouseEvent, useContext, useEffect, useMemo, useState } from 'react';

import Chart from './Chart';
import Legend from './Legend';

import { description, IMetric, IMetrics, IOrder, TOrderBy } from '../utils/utils';

/**
 * `IOptions` is the interface for all options which can be set by a user in the `PrometheusPage`. It extends the
 * `ITimes` interface so that we can also maintain the users time selection via our state.
 */
interface IOptions extends ITimes {
  queries: string[];
  resolution: string;
}

/**
 * The `PrometheusChart` component renders the chart for the returned metrics, the corresponding legend and some
 * additional options to adjust the style of the chart in the page. The component is also responsible for sorting the
 * provided `metrics` based on the user selection form the legend.
 */
const PrometheusChart: FunctionComponent<{
  metrics: IMetrics;
  options: IOptions;
  setOptions: (options: IOptions) => void;
}> = ({ metrics, options, setOptions }) => {
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar'>('line');
  const [stacked, setStacked] = useState<boolean>(false);
  const [selectedMetric, setSelectedMetric] = useState<string>('');

  const [order, setOrder] = useState<IOrder>({ order: 'asc', orderBy: 'name' });
  const [sortedMetrics, setSortedMetrics] = useState<IMetric[]>(metrics?.metrics ?? []);

  /**
   * `handleOrder` updates the `order` of the metrics based on the provided `orderBy` value.
   */
  const handleOrder = (orderBy: TOrderBy) => {
    const isAsc = order.orderBy === orderBy && order.order === 'asc';
    setOrder({
      order: isAsc ? 'desc' : 'asc',
      orderBy: orderBy,
    });
  };

  /**
   * Everytime the order or the provided metrics are changed we have to sort the metrics and store them in the
   * `sortedMetrics` state.
   */
  useEffect(() => {
    const tmpMetrics = metrics?.metrics ? [...metrics?.metrics] : [];
    if (order.order === 'asc') {
      tmpMetrics.sort((a, b) =>
        a[order.orderBy] > b[order.orderBy] ? 1 : a[order.orderBy] < b[order.orderBy] ? -1 : 0,
      );
    } else {
      tmpMetrics.sort((a, b) =>
        a[order.orderBy] < b[order.orderBy] ? 1 : a[order.orderBy] > b[order.orderBy] ? -1 : 0,
      );
    }
    setSortedMetrics(tmpMetrics);
  }, [order, metrics]);

  return (
    <Card sx={{ p: 4 }}>
      <Stack direction="column" spacing={6}>
        <Box>
          <Toolbar>
            <ToolbarItem>
              <ToggleButtonGroup
                size="small"
                value={chartType}
                exclusive={true}
                onChange={(_, value) => setChartType(value)}
              >
                <ToggleButton sx={{ px: 4 }} value="line">
                  Line
                </ToggleButton>
                <ToggleButton sx={{ px: 4 }} value="area">
                  Area
                </ToggleButton>
                <ToggleButton sx={{ px: 4 }} value="bar">
                  Bar
                </ToggleButton>
              </ToggleButtonGroup>
            </ToolbarItem>
            <ToolbarItem>
              <ToggleButtonGroup
                size="small"
                value={stacked}
                exclusive={true}
                onChange={(_, value) => setStacked(value)}
              >
                <ToggleButton sx={{ px: 4 }} value={false}>
                  Grouped
                </ToggleButton>
                <ToggleButton sx={{ px: 4 }} value={true}>
                  Stacked
                </ToggleButton>
              </ToggleButtonGroup>
            </ToolbarItem>
          </Toolbar>
        </Box>

        <Box height="350px">
          <Chart
            max={metrics.max}
            metrics={
              selectedMetric !== '' ? sortedMetrics.filter((metric) => metric.id === selectedMetric) : sortedMetrics
            }
            min={metrics.min}
            stacked={stacked}
            times={options}
            setTimes={(times: ITimes) =>
              setOptions({ ...options, time: times.time, timeEnd: times.timeEnd, timeStart: times.timeStart })
            }
            type={chartType}
          />
        </Box>

        <Box>
          <Legend
            padding="normal"
            metrics={sortedMetrics}
            selectedMetric={selectedMetric}
            setSelectedMetric={setSelectedMetric}
            order={order}
            handleOrder={handleOrder}
          />
        </Box>
      </Stack>
    </Card>
  );
};

/**
 * The `PrometheusWrapper` component is responsible for loading the metrics for the user provided PromQL queries in the
 * selected time range (`options`). We are using the `UseQueryWrapper` component then handles the result of the API call
 * and shows an error / info based on the result. When the API call succeeds the chart and legend will be rendered via
 * the `PrometheusChart` component
 */
const PrometheusWrapper: FunctionComponent<{
  instance: IPluginInstance;
  options: IOptions;
  setOptions: (options: IOptions) => void;
}> = ({ instance, options, setOptions }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  /**
   * Here we are loading the metrics based on the user provided options. After we get the metrics, we have to set /
   * convert some fields in the returned data. This means we have to set a color, we have to convert the x value to a
   * `Date` object and we have to set the custom properties, so we can use them in the tooltip.
   */
  const { isError, isLoading, error, data, refetch } = useQuery<IMetrics, APIError>(
    ['prometheus/range', instance, options],
    async () => {
      const result = await apiContext.client.post<IMetrics>('/api/plugins/prometheus/range', {
        body: {
          queries: options.queries.map((query) => ({ label: '', query: query })),
          resolution: options.resolution,
          timeEnd: options.timeEnd,
          timeStart: options.timeStart,
        },
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });

      if (result.metrics) {
        for (let i = 0; i < result.metrics.length; i++) {
          const color = getChartColor(i);
          result.metrics[i].color = color;

          for (let j = 0; j < result.metrics[i].data.length; j++) {
            result.metrics[i].data[j] = {
              color: color,
              name: result.metrics[i].name,
              x: new Date(result.metrics[i].data[j].x),
              y: result.metrics[i].data[j].y,
            };
          }
        }
        return result;
      } else {
        return result;
      }
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load metrics"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || !data.metrics || data.metrics.length === 0}
      noDataTitle="No metrics were found"
      noDataMessage={`No metrics were found for your provided ${options.queries.length === 1 ? 'query' : 'queries'}.`}
      refetch={refetch}
    >
      {data ? <PrometheusChart metrics={data} options={options} setOptions={setOptions} /> : null}
    </UseQueryWrapper>
  );
};

/**
 * The `PrometheusHistory` can be used to display a button next to a query field, which allows a user to access the
 * queries he run in the past. When the user clicks on the button, a menu with a list of the queries saved in the
 * history is shown. When a user clicks on a query the `setQuery` function is triggered for this query and should
 * replace the current value in the query field.
 *
 * `optionsQueries` must be the list of queries from the `options` in the `PrometheusPage` component.
 */
const PrometheusHistory: FunctionComponent<{ optionsQueries: string[]; setQuery: (query: string) => void }> = ({
  optionsQueries,
  setQuery,
}) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  /**
   * `queries` is a list of queries which are saved in the history. We refresh the list of queries each time the
   * provided `optionsQueries` (from the `options.queries` property) are changed, because this means that the user
   * executed a new request and a new query was added to the history. This way we can save some unnecessary calls to the
   * `getStateHistory` function.
   */
  const queries = useMemo(() => {
    return getStateHistory('kobs-prometheus-queryhistory');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [optionsQueries]);

  /**
   * `handleOpen` opens the menu, which is used to display the history, with all queries which were executed by a user
   * in the past.
   */
  const handleOpen = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  /**
   * `handleClose` closes the menu, wich displays the history, with all queries which were executed by a user in the
   * past.
   */
  const handleClose = () => {
    setAnchorEl(null);
  };

  /**
   * `handleSelect` handles the selection of a query in the history menu. The query will be passed to the `setQuery`
   * function and the menu will be closed.
   */
  const handleSelect = (query: string) => {
    handleClose();
    setQuery(query);
  };

  if (queries.length === 0) {
    return null;
  }

  return (
    <>
      <IconButton size="small" onClick={handleOpen}>
        <ManageSearch />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        {queries.map((query, index) => (
          <MenuItem key={index} onClick={() => handleSelect(query)}>
            <Typography noWrap={true}>{query}</Typography>
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

/**
 * The `PrometheusToolbar` component is used to render the toolbar for the Prometheus plugin. It allows a user to
 * provide a list of PromQL queries, to change the time interval and to set the resolution for the metrics he wants to
 * view.
 */
const PrometheusToolbar: FunctionComponent<{
  instance: IPluginInstance;
  options: IOptions;
  setOptions: (options: IOptions) => void;
}> = ({ instance, options, setOptions }) => {
  const [queries, setQueries] = useState<string[]>(options.queries);
  const latestQueries = useLatest(queries);

  /**
   * `addQuery` adds a new PromQL query to our list of queries. In the UI we will add a new editor field which can then
   * be used by a user to provide the actual PromQL query.
   */
  const addQuery = () => {
    const q = [...queries];
    q.push('');
    setQueries(q);
  };

  /**
   * `removeQuery` removes a PromQL query from our list of queries. In the UI we will remove the corresponding editor
   * field with the provided `index`.
   */
  const removeQuery = (index: number) => {
    const tmpQueries = [...queries];
    tmpQueries.splice(index, 1);
    setQueries(tmpQueries);
  };

  /**
   * `changeQuery` changes the value of the query with the provided `index` to the provided `value`.
   */
  const changeQuery = (index: number, value: string) => {
    const tmpQueries = [...latestQueries.current];
    tmpQueries[index] = value;
    setQueries(tmpQueries);
  };

  /**
   * `changeOptions` is the function which is passed to the `Options` component, to call the `setOptions` function when
   * a user clicks on the search button, changes the selected time range or sets a resolution.
   *
   * We also add all the queries to the history of Prometheus queries when the function is triggered, so that a user has
   * easy access to the last 10 queries he run.
   */
  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined) => {
    if (additionalFields && additionalFields.length === 1) {
      addStateHistoryItems('kobs-prometheus-queryhistory', queries);
      setOptions({ ...times, queries: queries, resolution: additionalFields[0].value });
    }
  };

  /**
   * `handleSubmit` is the function we pass to our `Editor` component so that we can submit the provided query by
   * calling the `setOptions` function when a user presses `Shift + Enter`.
   *
   * We also add all the queries to the history of Prometheus queries when the function is triggered, so that a user has
   * easy access to the last 10 queries he run.
   */
  const handleSubmit = () => {
    addStateHistoryItems('kobs-prometheus-queryhistory', queries);
    setOptions({ ...options, queries: queries });
  };

  return (
    <Toolbar>
      <ToolbarItem grow={true}>
        {queries.map((query, index) => (
          <Box
            key={index}
            sx={{
              mb: index !== queries.length - 1 ? 3 : 0,
            }}
          >
            <Editor
              language="promql"
              languageOptions={instance}
              minimal={true}
              value={query}
              onChange={(value) => changeQuery(index, value)}
              handleSubmit={() => handleSubmit()}
              adornment={
                <InputAdornment position="end">
                  <PrometheusHistory optionsQueries={options.queries} setQuery={(query) => changeQuery(index, query)} />
                  {index === 0 ? (
                    <IconButton size="small" onClick={addQuery}>
                      <Add />
                    </IconButton>
                  ) : (
                    <IconButton size="small" onClick={(): void => removeQuery(index)}>
                      <Remove />
                    </IconButton>
                  )}
                </InputAdornment>
              }
            />
          </Box>
        ))}
      </ToolbarItem>

      <ToolbarItem align="right">
        <Options
          additionalFields={[
            {
              label: 'Resolution',
              name: 'resolution',
              placeholder: '1m',
              value: options.resolution,
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
 * The `PrometheusPage` component is used to render the Prometheus plugin in a React Router route. It allows a user to
 * directly query the provided Prometheus `instance`.
 */
const PrometheusPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  const [options, setOptions] = useQueryState<IOptions>({
    queries: [''],
    resolution: '',
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
  });

  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
      toolbar={<PrometheusToolbar instance={instance} options={options} setOptions={setOptions} />}
    >
      {!options.queries || options.queries.length === 0 || options.queries[0] === '' ? (
        <Alert severity="info">
          <AlertTitle>Provide a PromQL query</AlertTitle>
          You have to provide at least one PromQL query.
        </Alert>
      ) : (
        <PrometheusWrapper instance={instance} options={options} setOptions={setOptions} />
      )}
    </Page>
  );
};

export default PrometheusPage;
