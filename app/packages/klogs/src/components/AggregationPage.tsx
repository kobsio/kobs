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
  addStateHistoryItem,
  pluginBasePath,
  useQueryState,
} from '@kobsio/core';
import { MoreVert } from '@mui/icons-material';
import {
  Autocomplete,
  FilterOptionsState,
  Grid,
  IconButton,
  InputAdornment,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  TextField,
  createFilterOptions,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, MouseEvent, useContext, useEffect } from 'react';
import { useState } from 'react';
import { Link } from 'react-router-dom';

import { Aggregation } from './Aggregation';
import { QueryHistory } from './QueryHistory';

import { IAggregationOptions } from '../utils/aggregation';
import { description, defaultCompletions } from '../utils/utils';

const AggregationActions: FunctionComponent<{ instance: IPluginInstance; options: IAggregationOptions }> = ({
  instance,
  options,
}) => {
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
          to={`${pluginBasePath(instance)}?query=${encodeURIComponent(options.query)}&time=${options.time}&timeStart=${
            options.timeStart
          }&timeEnd=${options.timeEnd}`}
        >
          <ListItemText>Logs</ListItemText>
        </MenuItem>

        <MenuItem component="a" href="https://kobs.io/main/plugins/klogs/" target="_blank">
          <ListItemText>Documentation</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

const AggregationToolbar: FunctionComponent<{
  instance: IPluginInstance;
  options: IAggregationOptions;
  setOptions: (options: IAggregationOptions) => void;
}> = ({ instance, options, setOptions }) => {
  const filter = createFilterOptions<string>();
  const [internalOptions, setInternalOptions] = useState<IAggregationOptions>(options);
  const apiContext = useContext<IAPIContext>(APIContext);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data } = useQuery<any[], APIError>(['klogs/fields', instance], async () => {
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
    addStateHistoryItem('kobs-klogs-queryhistory', internalOptions.query);
    setOptions({
      ...internalOptions,
      ...times,
    });
  };

  const handleSubmit = () => {
    addStateHistoryItem('kobs-klogs-queryhistory', internalOptions.query);
    setOptions(internalOptions);
  };

  const filterOptions = (options: string[], state: FilterOptionsState<string>) => {
    const filtered = filter(options, state);
    return filtered.slice(0, 64);
  };

  useEffect(() => {
    setInternalOptions(options);
  }, [options]);

  return (
    <Grid container={true} spacing={2}>
      <Grid item={true} xs={12} md={2}>
        Query
      </Grid>
      <Grid item={true} xs={12} md={10}>
        {data && (
          <Editor
            language="klogs"
            languageOptions={{
              completions: data,
            }}
            minimal={true}
            value={internalOptions.query}
            onChange={(value) => setInternalOptions({ ...internalOptions, query: value })}
            handleSubmit={handleSubmit}
            adornment={
              <InputAdornment position="end">
                <QueryHistory
                  optionsQuery={options.query}
                  setQuery={(query) => setInternalOptions({ ...internalOptions, query: query })}
                />
              </InputAdornment>
            }
          />
        )}
      </Grid>

      <Grid item={true} xs={12} md={2}>
        Chart
      </Grid>
      <Grid item={true} xs={12} md={10}>
        <Select
          size="small"
          fullWidth={true}
          value={internalOptions.chart}
          onChange={(e) => setInternalOptions({ ...internalOptions, chart: e.target.value })}
        >
          <MenuItem value="pie">Pie</MenuItem>
          <MenuItem value="bar">Bar</MenuItem>
          <MenuItem value="line">Line</MenuItem>
          <MenuItem value="area">Area</MenuItem>
        </Select>
      </Grid>

      {internalOptions.chart === 'pie' && (
        <>
          <Grid item={true} xs={12} md={2}>
            Slice by
          </Grid>
          <Grid item={true} xs={12} md={10}>
            <Autocomplete
              size="small"
              value={internalOptions.sliceBy}
              onChange={(e, value) => setInternalOptions({ ...internalOptions, sliceBy: value || '' })}
              options={data || []}
              filterOptions={filterOptions}
              renderInput={(params) => <TextField {...params} />}
            />
          </Grid>

          <Grid item={true} xs={12} md={2}>
            Size by operation
          </Grid>
          <Grid item={true} xs={12} md={10}>
            <Select
              size="small"
              fullWidth={true}
              value={internalOptions.sizeByOperation}
              onChange={(e) => setInternalOptions({ ...internalOptions, sizeByOperation: e.target.value })}
            >
              <MenuItem value="count">count</MenuItem>
              <MenuItem value="min">min</MenuItem>
              <MenuItem value="max">max</MenuItem>
              <MenuItem value="sum">sum</MenuItem>
              <MenuItem value="avg">avg</MenuItem>
            </Select>
          </Grid>

          {internalOptions.sizeByOperation !== 'count' && (
            <>
              <Grid item={true} xs={12} md={2}>
                Size by field
              </Grid>
              <Grid item={true} xs={12} md={10}>
                <Autocomplete
                  size="small"
                  value={internalOptions.sizeByField}
                  onChange={(e, value) => setInternalOptions({ ...internalOptions, sizeByField: value || '' })}
                  options={data || []}
                  filterOptions={filterOptions}
                  renderInput={(params) => <TextField {...params} />}
                />
              </Grid>
            </>
          )}
        </>
      )}

      {(internalOptions.chart === 'line' || internalOptions.chart === 'area' || internalOptions.chart === 'bar') && (
        <>
          <Grid item={true} xs={12} md={2}>
            Horizontal axis operation
          </Grid>
          <Grid item={true} xs={12} md={10}>
            <Select
              size="small"
              fullWidth={true}
              value={internalOptions.horizontalAxisOperation}
              onChange={(e) => setInternalOptions({ ...internalOptions, horizontalAxisOperation: e.target.value })}
            >
              <MenuItem value="time">time</MenuItem>
              {internalOptions.chart === 'bar' && <MenuItem value="top">top</MenuItem>}
            </Select>
          </Grid>

          {internalOptions.horizontalAxisOperation === 'top' && (
            <>
              <Grid item={true} xs={12} md={2}>
                Horizontal axis field
              </Grid>
              <Grid item={true} xs={12} md={10}>
                <Autocomplete
                  size="small"
                  value={internalOptions.horizontalAxisField}
                  onChange={(e, value) => setInternalOptions({ ...internalOptions, horizontalAxisField: value || '' })}
                  options={data || []}
                  filterOptions={filterOptions}
                  renderInput={(params) => <TextField {...params} />}
                />
              </Grid>

              <Grid item={true} xs={12} md={2}>
                Horizontal axis order
              </Grid>
              <Grid item={true} xs={12} md={10}>
                <Select
                  size="small"
                  fullWidth={true}
                  value={internalOptions.horizontalAxisOrder}
                  onChange={(e) => setInternalOptions({ ...internalOptions, horizontalAxisOrder: e.target.value })}
                >
                  <MenuItem value="ascending">ascending</MenuItem>
                  <MenuItem value="descending">descending</MenuItem>
                </Select>
              </Grid>

              <Grid item={true} xs={12} md={2}>
                Horizontal axis limit
              </Grid>
              <Grid item={true} xs={12} md={10}>
                <TextField
                  size="small"
                  fullWidth={true}
                  type="number"
                  value={options.horizontalAxisLimit}
                  onChange={(e) =>
                    setInternalOptions({ ...internalOptions, horizontalAxisLimit: parseInt(e.target.value) })
                  }
                />
              </Grid>
            </>
          )}

          <Grid item={true} xs={12} md={2}>
            Vertical axis operation
          </Grid>
          <Grid item={true} xs={12} md={10}>
            <Select
              size="small"
              fullWidth={true}
              value={internalOptions.verticalAxisOperation}
              onChange={(e) => setInternalOptions({ ...internalOptions, verticalAxisOperation: e.target.value })}
            >
              <MenuItem value="count">count</MenuItem>
              <MenuItem value="min">min</MenuItem>
              <MenuItem value="max">max</MenuItem>
              <MenuItem value="sum">sum</MenuItem>
              <MenuItem value="avg">avg</MenuItem>
            </Select>
          </Grid>

          {internalOptions.verticalAxisOperation !== 'count' && (
            <>
              <Grid item={true} xs={12} md={2}>
                Vertical axis field
              </Grid>
              <Grid item={true} xs={12} md={10}>
                <Autocomplete
                  size="small"
                  value={internalOptions.verticalAxisField}
                  onChange={(e, value) => setInternalOptions({ ...internalOptions, verticalAxisField: value || '' })}
                  options={data || []}
                  filterOptions={filterOptions}
                  renderInput={(params) => <TextField {...params} />}
                />
              </Grid>
            </>
          )}

          <Grid item={true} xs={12} md={2}>
            Break down by fields
          </Grid>
          <Grid item={true} xs={12} md={10}>
            <Autocomplete
              size="small"
              multiple={true}
              value={internalOptions.breakDownByFields}
              onChange={(e, value) => setInternalOptions({ ...internalOptions, breakDownByFields: value || [] })}
              options={data || []}
              filterOptions={filterOptions}
              renderInput={(params) => <TextField {...params} />}
            />
          </Grid>

          <Grid item={true} xs={12} md={2}>
            Break down by filters
          </Grid>
          <Grid item={true} xs={12} md={10}>
            <Autocomplete
              size="small"
              freeSolo={true}
              multiple={true}
              value={internalOptions.breakDownByFilters}
              onChange={(e, value) => setInternalOptions({ ...internalOptions, breakDownByFilters: value || [] })}
              options={[]}
              renderInput={(params) => <TextField {...params} />}
            />
          </Grid>
        </>
      )}

      <Grid item={true} xs={12} md={2}></Grid>
      <Grid item={true} xs={12} md={10}>
        <Options times={options} showOptions={true} showSearchButton={true} setOptions={changeOptions} />
      </Grid>
    </Grid>
  );
};

const AggregationPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  const [options, setOptions] = useQueryState<IAggregationOptions>({
    breakDownByFields: [],
    breakDownByFilters: [],
    chart: 'pie',
    horizontalAxisField: '',
    horizontalAxisLimit: 10,
    horizontalAxisOperation: 'time',
    horizontalAxisOrder: 'ascending',
    query: '',
    sizeByField: '',
    sizeByOperation: 'count',
    sliceBy: '',
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
    verticalAxisField: '',
    verticalAxisOperation: 'count',
  });

  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
      toolbar={<AggregationToolbar instance={instance} options={options} setOptions={setOptions} />}
      actions={<AggregationActions instance={instance} options={options} />}
    >
      <Aggregation
        instance={instance}
        options={options}
        setTimes={(times: ITimes) => setOptions({ ...options, ...times })}
      />
    </Page>
  );
};

export default AggregationPage;
