import {
  APIContext,
  APIError,
  IPluginPageProps,
  ITimes,
  Link,
  Page,
  timeOptions,
  useQueryState,
  UseQueryWrapper,
} from '@kobsio/core';
import { Description, TableView } from '@mui/icons-material';
import { FormControl, IconButton, MenuItem, Tooltip, Select, TextField, Stack, Paper, InputLabel } from '@mui/material';
import Autocomplete from '@mui/material/Autocomplete';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext, useState } from 'react';
import { useLocation } from 'react-router-dom';

import AggregationChart from './AggregationChart';
import { AxisOp, IAggregationData, IAggregationSearch } from './AggregationTypes';
import { defaultSearch, now } from './LogsPage';
import LogsToolbar from './LogsToolbar';

import { chartOptionsToRequestOptions } from '../utils/aggregation';

const AggregationPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  const { client } = useContext(APIContext);
  const { search: rawSearch } = useLocation();
  const [lastSearch, setLastSeach] = useState(now());
  const [search, setSearch] = useQueryState<IAggregationSearch>({
    chart: 'pie',
    sizeByField: '',
    sizeByOperation: 'count',
    sliceBy: '',
    ...defaultSearch,
  });

  const queryResult = useQuery<IAggregationData | null, APIError>(
    ['klogs/aggregation', instance, search, lastSearch],
    async () => {
      const options = chartOptionsToRequestOptions(search);
      if (options === null) {
        return null;
      }

      let timeEnd: number, timeStart: number;
      if (search.time === 'custom') {
        timeEnd = search.timeEnd;
        timeStart = search.timeStart;
      } else {
        timeEnd = now();
        timeStart = timeEnd - timeOptions[search.time].seconds;
      }

      return client.post<IAggregationData>(`/api/plugins/klogs/aggregation`, {
        body: {
          chart: search.chart,
          options: options,
          query: search.query,
          times: {
            timeEnd: timeEnd,
            timeStart: timeStart,
          },
        },
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
    },
  );

  const { data: columnSuggestions } = useQuery<string[], APIError>([], () =>
    client.get<string[]>(`/api/plugins/klogs/fields`, {
      headers: {
        'x-kobs-cluster': instance.cluster,
        'x-kobs-plugin': instance.name,
      },
    }),
  );

  const handleChangeTime = ({ time, timeEnd, timeStart }: ITimes) => {
    setLastSeach(now());
    setSearch({
      time: time,
      ...(time === 'custom' ? { timeEnd, timeStart } : undefined),
    });
  };

  const handleSearch = (query: string) => {
    return setSearch({ query: query });
  };

  const handleSetChart = (chart: IAggregationSearch['chart']) => {
    if (chart === 'pie') {
      setSearch({
        breakDownByFields: undefined,
        breakDownByFilters: undefined,
        chart: 'pie',
        horizontalAxisOperation: undefined,
        sizeByOperation: 'count',
        verticalAxisField: undefined,
        verticalAxisOperation: undefined,
      });
    }
    if (chart === 'bar' || chart === 'line' || chart === 'area') {
      setSearch({
        breakDownByField: [],
        breakDownByFilter: [],
        chart: chart,
        horizontalAxisOperation: 'time',
        verticalAxisOperation: 'count',
      } as Partial<IAggregationSearch>);
    }
  };

  return (
    <Page
      title="klogs"
      description="Fast, scalable and reliable logging using Fluent Bit and ClickHouse."
      subtitle={instance.cluster}
      toolbar={
        <LogsToolbar
          {...search}
          handlers={{ onChangeTime: handleChangeTime, onSearch: handleSearch }}
          instance={instance}
        />
      }
      actions={
        <>
          <Tooltip title="Documentation">
            <IconButton component="a" href="https://kobs.io/main/plugins/klogs/" target="_blank">
              <Description />
            </IconButton>
          </Tooltip>
          <Tooltip title="Logs view">
            <IconButton component={Link} to={`..${rawSearch}`}>
              <TableView />
            </IconButton>
          </Tooltip>
        </>
      }
    >
      <Stack direction="row" spacing={2} alignItems="flex-start">
        <Paper sx={{ p: 4 }} component="form" elevation={0}>
          <Stack direction="column" sx={{ width: '250px' }} spacing={4}>
            <FormControl size="small">
              <InputLabel id="chart">Chart</InputLabel>
              <Select
                fullWidth={true}
                labelId="chart"
                value={search.chart}
                label="Chart"
                onChange={(e) => handleSetChart(e.target.value as IAggregationSearch['chart'])}
              >
                <MenuItem value="pie">pie</MenuItem>
                <MenuItem value="bar">bar</MenuItem>
                <MenuItem value="line">line</MenuItem>
                <MenuItem value="area">area</MenuItem>
              </Select>
            </FormControl>

            {search.chart === 'pie' && (
              <>
                <Autocomplete
                  size="small"
                  disablePortal={true}
                  freeSolo={true}
                  id="sliceBy"
                  value={search.sliceBy}
                  onChange={(e, value) => setSearch({ sliceBy: value || '' })}
                  options={columnSuggestions || []}
                  renderInput={(params) => <TextField {...params} label="Slize By" />}
                />

                <FormControl size="small">
                  <InputLabel id="sizeByOperation">Size by operation</InputLabel>
                  <Select
                    fullWidth={true}
                    labelId="sizeByOperation"
                    value={search.sizeByOperation}
                    label="Size by operation"
                    onChange={(e) =>
                      setSearch({
                        sizeByOperation: e.target.value as AxisOp,
                      })
                    }
                  >
                    <MenuItem value="count">count</MenuItem>
                    <MenuItem value="min">min</MenuItem>
                    <MenuItem value="max">max</MenuItem>
                    <MenuItem value="sum">sum</MenuItem>
                    <MenuItem value="avg">avg</MenuItem>
                  </Select>
                </FormControl>

                <TextField
                  size="small"
                  id="sizeByField"
                  label="Size By field"
                  value={search.sizeByField}
                  onChange={(e) => setSearch({ sizeByField: e.target.value })}
                  fullWidth={true}
                />
              </>
            )}

            {(search.chart === 'line' || search.chart === 'area' || search.chart === 'bar') && (
              <>
                <FormControl size="small">
                  <InputLabel id="horizontalAxisOperation">Horizontal axis operation</InputLabel>
                  <Select
                    fullWidth={true}
                    labelId="horizontalAxisOperation"
                    value={search.horizontalAxisOperation}
                    label="Horizontal axis operation"
                    onChange={(e) =>
                      setSearch({
                        horizontalAxisOperation: e.target.value as 'time',
                      })
                    }
                  >
                    <MenuItem value="time">time</MenuItem>
                    {search.chart === 'bar' && <MenuItem value="top">top</MenuItem>}
                  </Select>
                </FormControl>

                {search.horizontalAxisOperation === 'top' && (
                  <Autocomplete
                    size="small"
                    disablePortal={true}
                    freeSolo={true}
                    id="horizontalAxisField"
                    value={
                      (search.chart === 'bar' &&
                        search.horizontalAxisOperation === 'top' &&
                        search.horizontalAxisField) ||
                      ''
                    }
                    onChange={(e, value) => setSearch({ horizontalAxisField: value || '' })}
                    options={columnSuggestions || []}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Horizontal axis field
                  "
                      />
                    )}
                  />
                )}

                {search.horizontalAxisOperation === 'top' && (
                  <FormControl size="small">
                    <InputLabel id="horizontalAxisOrder">Horizontal axis order</InputLabel>
                    <Select
                      fullWidth={true}
                      labelId="horizontalAxisOrder"
                      value={
                        (search.chart === 'bar' &&
                          search.horizontalAxisOperation === 'top' &&
                          search.horizontalAxisOrder) ||
                        'ascending'
                      }
                      label="Horizontal axis operation"
                      onChange={(e) =>
                        setSearch({
                          horizontalAxisOrder: e.target.value as 'ascending' | 'descending',
                        })
                      }
                    >
                      <MenuItem value="ascending">ascending</MenuItem>
                      <MenuItem value="descending">descending</MenuItem>
                    </Select>
                  </FormControl>
                )}

                {search.horizontalAxisOperation === 'top' && (
                  <TextField
                    label="Horizontal axis limit"
                    size="small"
                    value={
                      (search.chart === 'bar' &&
                        search.horizontalAxisOperation === 'top' &&
                        search.horizontalAxisLimit) ||
                      ''
                    }
                    onChange={(e) => {
                      setSearch({
                        horizontalAxisLimit: e.target.value,
                      });
                    }}
                  />
                )}

                <FormControl size="small">
                  <InputLabel id="verticalAxisOperation">Vertical axis operation</InputLabel>
                  <Select
                    fullWidth={true}
                    labelId="verticalAxisOperation"
                    value={search.verticalAxisOperation}
                    label="Vertical axis operation"
                    onChange={(e) =>
                      setSearch({
                        verticalAxisOperation: e.target.value as AxisOp,
                      })
                    }
                  >
                    <MenuItem value="count">count</MenuItem>
                    <MenuItem value="min">min</MenuItem>
                    <MenuItem value="max">max</MenuItem>
                    <MenuItem value="sum">sum</MenuItem>
                    <MenuItem value="avg">avg</MenuItem>
                  </Select>
                </FormControl>

                {search.verticalAxisOperation !== 'count' && (
                  <Autocomplete
                    size="small"
                    disablePortal={true}
                    freeSolo={true}
                    id="verticalAxisField"
                    value={search.verticalAxisField}
                    onChange={(e, value) => setSearch({ verticalAxisField: value || '' })}
                    options={columnSuggestions || []}
                    renderInput={(params) => <TextField {...params} label="Vertical axis field" />}
                  />
                )}

                <Autocomplete
                  size="small"
                  disablePortal={true}
                  freeSolo={true}
                  multiple={true}
                  id="breakDownByFields"
                  value={search.breakDownByFields}
                  onChange={(e, value) => setSearch({ breakDownByFields: value || [] })}
                  options={columnSuggestions || []}
                  renderInput={(params) => <TextField {...params} label="Break down by fields" />}
                />

                <Autocomplete
                  size="small"
                  id="breakDownByFilters"
                  multiple={true}
                  freeSolo={true}
                  value={search.breakDownByFilters}
                  onChange={(e, value) => setSearch({ breakDownByFilters: value || [] })}
                  fullWidth={true}
                  options={[]}
                  renderInput={(params) => <TextField {...params} label="Break down by filters" />}
                />
              </>
            )}
          </Stack>
        </Paper>
        <Paper sx={{ height: '500px', p: 4, width: '100%' }} elevation={0}>
          <UseQueryWrapper
            errorTitle={'aggregation failed'}
            {...queryResult}
            isNoData={!queryResult.data}
            noDataTitle="no data found"
          >
            {queryResult.data && <AggregationChart data={queryResult.data} options={search} />}
          </UseQueryWrapper>
        </Paper>
      </Stack>
    </Page>
  );
};

export default AggregationPage;
