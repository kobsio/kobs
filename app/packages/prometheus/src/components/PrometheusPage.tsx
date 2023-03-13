import {
  MUIEditor,
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
} from '@kobsio/core';
import { Add, Remove } from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  Card,
  IconButton,
  InputBaseComponentProps,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { forwardRef, FunctionComponent, useContext, useEffect, useState } from 'react';

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

  const [order, setOrder] = useState<IOrder>({ order: 'asc', orderBy: 'label' });
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
          queries: options.queries.map((query) => {
            return { label: '', query: query };
          }),
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
              customColor: color,
              customLabel: result.metrics[i].label,
              customMaxX: options.timeEnd,
              customMaxY: result.max,
              customMinX: options.timeStart,
              customMinY: result.min,
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
 * The `InternalEditor` component is a wrapper around our `MUIEditor` component, which allows us to use the editor
 * within a `TextField` component of MUI.
 */
const InternalEditor = forwardRef<HTMLInputElement, InputBaseComponentProps>(function InternalEditor(props, ref) {
  const { loadCompletionItems, callSubmit, value, onChange } = props;

  const handleOnChange = (value: string | undefined) => {
    if (onChange) {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      onChange({ target: { value: value ?? '' } });
    }
  };

  return (
    <MUIEditor
      value={value}
      onChange={handleOnChange}
      language="promql"
      loadCompletionItems={loadCompletionItems}
      callSubmit={callSubmit}
    />
  );
});

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
  const apiContext = useContext<IAPIContext>(APIContext);
  const [queries, setQueries] = useState<string[]>(options.queries);

  /**
   * `loadCompletionItems` is the function which we pass to the `MUIEditor` to load additional completion items for the
   * monaco editor. Currently we are just loading all available metrics from the Prometheus instance.
   *
   * NOTE: We should also add support for labels and label values.
   */
  const loadCompletionItems = (): Promise<string[]> => {
    return apiContext.client.get<string[]>(`/api/plugins/prometheus/completions`, {
      headers: {
        'x-kobs-cluster': instance.cluster,
        'x-kobs-plugin': instance.name,
      },
    });
  };

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
    const tmpQueries = [...queries];
    tmpQueries[index] = value;
    setQueries(tmpQueries);
  };

  /**
   * `changeOptions` is the function which is passed to the `Options` component, to call the `setOptions` function when
   * a user clicks on the search button, changes the selected time range or sets a resolution.
   */
  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined) => {
    if (additionalFields && additionalFields.length === 1) {
      setOptions({ ...times, queries: queries, resolution: additionalFields[0].value });
    }
  };

  /**
   * `callSubmit` is the function we pass to our `MUIEditor` component so that we can submit the provided query by
   * calling the `setOptions` function when a user presses `Shift + Enter`.
   */
  const callSubmit = () => {
    setOptions({ ...options, queries: queries });
  };

  return (
    <Toolbar>
      <ToolbarItem grow={true}>
        <Box sx={{ display: 'flex', flexDirection: 'column', flexWrap: 'wrap', gap: 3 }}>
          {queries.map((query, index) => (
            <Box key={index} sx={{ flexGrow: 1 }}>
              <Box sx={{ alignItems: 'start', display: 'flex', flexDirection: 'row', flexWrap: 'nowrap', gap: 3 }}>
                <Box sx={{ flexGrow: 1 }}>
                  <TextField
                    value={query}
                    onChange={(e) => changeQuery(index, e.target.value)}
                    InputProps={{
                      inputComponent: InternalEditor,
                      inputProps: {
                        callSubmit: callSubmit,
                        loadCompletionItems: loadCompletionItems,
                      },
                    }}
                    fullWidth={true}
                  />
                </Box>
                {index === 0 ? (
                  <IconButton size="small" onClick={addQuery}>
                    <Add />
                  </IconButton>
                ) : (
                  <IconButton size="small" onClick={(): void => removeQuery(index)}>
                    <Remove />
                  </IconButton>
                )}
              </Box>
            </Box>
          ))}
        </Box>
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
