import {
  IOptionsAdditionalFields,
  IPluginInstance,
  IPluginPageProps,
  ITimes,
  Options,
  Page,
  pluginBasePath,
  Toolbar,
  ToolbarItem,
  useLocalStorageState,
  useQueryState,
} from '@kobsio/core';
import { Clear, CompareArrows, MoreVert, OpenInNew, ScatterPlot, ShowChart } from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Checkbox,
  Divider,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  OutlinedInput,
  Select,
  TextField,
} from '@mui/material';
import { ChangeEvent, FormEvent, FunctionComponent, useEffect, useState } from 'react';
import { Route, Routes, useNavigate, useParams } from 'react-router-dom';
import { Link } from 'react-router-dom';

import { MonitorOperations, MonitorServiceCalls, MonitorServiceErrors, MonitorServiceLatency } from './Monitor';
import { SelectOperation } from './SelectOperation';
import { SelectService } from './SelectService';
import { TraceID, TraceData } from './Trace';
import { Traces } from './Traces';

import { description, spanKinds, ITrace } from '../utils/utils';

interface ITracePageParams extends Record<string, string | undefined> {
  traceID?: string;
}

interface IMonitorPageOptions extends ITimes {
  service: string;
  spanKinds: string[];
}

interface ITracesPageOptions extends ITimes {
  limit: string;
  maxDuration: string;
  minDuration: string;
  operation: string;
  service: string;
  tags: string;
}

const JaegerPageActions: FunctionComponent<{
  instance: IPluginInstance;
}> = ({ instance }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
        <MoreVert />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <MenuItem component={Link} to={`${pluginBasePath(instance)}`}>
          <ListItemIcon>
            <ScatterPlot fontSize="small" />
          </ListItemIcon>
          <ListItemText>Traces</ListItemText>
        </MenuItem>
        <MenuItem component={Link} to={`${pluginBasePath(instance)}/trace`}>
          <ListItemIcon>
            <CompareArrows fontSize="small" />
          </ListItemIcon>
          <ListItemText>Compare Traces</ListItemText>
        </MenuItem>
        <MenuItem component={Link} to={`${pluginBasePath(instance)}/monitor`}>
          <ListItemIcon>
            <ShowChart fontSize="small" />
          </ListItemIcon>
          <ListItemText>Monitor</ListItemText>
        </MenuItem>

        {instance.options?.address && (
          <MenuItem component={Link} to={instance.options.address} target="_blank">
            <ListItemIcon>
              <OpenInNew fontSize="small" />
            </ListItemIcon>
            <ListItemText>Open Jaeger</ListItemText>
          </MenuItem>
        )}
      </Menu>
    </>
  );
};

const MonitorPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  const [persistedOptions, setPersistedOptions] = useLocalStorageState<IMonitorPageOptions>(
    'kobs-jaeger-monitorpage-options',
    {
      service: '',
      spanKinds: spanKinds,
      time: 'custom',
      timeEnd: 0,
      timeStart: 0,
    },
  );
  const [options, setOptions] = useQueryState<IMonitorPageOptions>({
    service: persistedOptions.service,
    spanKinds: persistedOptions.spanKinds,
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
  });

  /**
   * `useEffect` is used to persist the options, when they are changed by a user.
   */
  useEffect(() => {
    setPersistedOptions(options);
  }, [options, setPersistedOptions]);

  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
      toolbar={
        <Toolbar>
          <ToolbarItem grow={true}>
            <SelectService
              instance={instance}
              selectedService={options.service}
              selectService={(service) => setOptions({ ...options, service: service })}
            />
          </ToolbarItem>
          <ToolbarItem width="250px">
            <FormControl size="small" fullWidth={true}>
              <InputLabel id="jaeger-monitorpage-spankinds">Span Kinds</InputLabel>
              <Select
                labelId="jaeger-monitorpage-spankinds"
                size="small"
                multiple={true}
                value={options.spanKinds}
                onChange={(e) =>
                  setOptions({
                    ...options,
                    spanKinds: typeof e.target.value === 'string' ? e.target.value.split(',') : e.target.value,
                  })
                }
                input={<OutlinedInput label="Span Kinds" />}
                renderValue={(selected) => selected.join(', ')}
              >
                {spanKinds.map((spanKind) => (
                  <MenuItem key={spanKind} value={spanKind}>
                    <Checkbox size="small" sx={{ p: 0, pr: 2 }} checked={options.spanKinds.indexOf(spanKind) > -1} />
                    <ListItemText primary={spanKind} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </ToolbarItem>
          <ToolbarItem align="right">
            <Options
              times={options}
              showOptions={true}
              showSearchButton={false}
              setOptions={(times, _) => setOptions({ ...times, service: options.service })}
            />
          </ToolbarItem>
        </Toolbar>
      }
      actions={<JaegerPageActions instance={instance} />}
    >
      {!options.service || !options.spanKinds || options.spanKinds.length === 0 ? (
        <Alert severity="info">
          <AlertTitle>Select a service and span kinds</AlertTitle>
          You have to select a service and at least one span kind.
        </Alert>
      ) : (
        <>
          {options.service && options.spanKinds.length > 0 ? (
            <Grid container={true} spacing={4}>
              <Grid item={true} sx={{ height: '300px' }} xs={12} lg={4}>
                <MonitorServiceLatency
                  title="Latency (ms)"
                  instance={instance}
                  service={options.service}
                  spanKinds={options.spanKinds}
                  showActions={false}
                  times={options}
                />
              </Grid>
              <Grid item={true} sx={{ height: '300px' }} xs={12} lg={4}>
                <MonitorServiceErrors
                  title="Error Rate (%)"
                  instance={instance}
                  service={options.service}
                  spanKinds={options.spanKinds}
                  showActions={false}
                  times={options}
                />
              </Grid>
              <Grid item={true} sx={{ height: '300px' }} xs={12} lg={4}>
                <MonitorServiceCalls
                  title="Request Rate (req/s)"
                  instance={instance}
                  service={options.service}
                  spanKinds={options.spanKinds}
                  showActions={false}
                  times={options}
                />
              </Grid>
              <Grid item={true} xs={12}>
                <MonitorOperations
                  title="Operations"
                  instance={instance}
                  service={options.service}
                  spanKinds={options.spanKinds}
                  showActions={false}
                  times={options}
                />
              </Grid>
            </Grid>
          ) : null}
        </>
      )}
    </Page>
  );
};

const TracePageSelectTrace: FunctionComponent<{
  instance: IPluginInstance;
  setTrace: (trace: ITrace) => void;
  setTraceID: (traceID: string) => void;
}> = ({ instance, setTrace, setTraceID }) => {
  const [internalTraceID, setInternalTraceID] = useState<string>('');

  const handleSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const reader = new FileReader();
      reader.readAsText(e.target.files[0], 'UTF-8');
      reader.onload = (e): void => {
        if (e.target && e.target.result && typeof e.target.result === 'string') {
          const traceData = JSON.parse(e.target.result).data;
          setTrace(traceData[0]);
        }
      };
    }
  };

  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
      toolbar={
        <Toolbar>
          <ToolbarItem grow={true}>
            <Box component="form" onSubmit={() => setTraceID(internalTraceID)}>
              <TextField
                size="small"
                variant="outlined"
                placeholder="Provide a Trace ID"
                fullWidth={true}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setTraceID('')}>
                        <Clear />
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
                value={internalTraceID}
                onChange={(e) => setInternalTraceID(e.target.value)}
              />
            </Box>
          </ToolbarItem>

          <ToolbarItem>
            <Divider orientation="vertical">or</Divider>
          </ToolbarItem>

          <ToolbarItem grow={true}>
            <Button fullWidth={true} variant="contained" component="label">
              Select a File
              <input type="file" hidden={true} onChange={handleSelectFile} />
            </Button>
          </ToolbarItem>
        </Toolbar>
      }
      actions={<JaegerPageActions instance={instance} />}
    ></Page>
  );
};

const TracePage: FunctionComponent<{ instance: IPluginInstance }> = ({ instance }) => {
  const params = useParams<ITracePageParams>();
  const navigate = useNavigate();
  const [options, setOptions] = useQueryState<{ compareTraceID: string }>({ compareTraceID: '' });
  const [uploadedTrace, setUploadedTrace] = useState<ITrace | undefined>(undefined);

  /**
   * `changeCompareTrace` is used to set the trace id. If no trace id is provided as parameter, it sets the traceID
   * parameter. If a trace id is provided it sets the trace id as compare paramter to compare the two traces.
   */
  const changeCompareTrace = (traceID: string): void => {
    if (params.traceID) {
      setOptions({ compareTraceID: traceID });
    } else {
      navigate(`${pluginBasePath(instance)}/trace/${traceID}`);
    }
  };

  // handleUpload handles the upload of a JSON file, which contains a trace. When the file upload is finished we parse
  // the content of the file and set the uploadedTrace state. This state (trace) is then passed to the first
  // TraceCompareID so that the trace can be viewed.
  const handleUpload = (trace: ITrace): void => {
    setUploadedTrace(trace);
    navigate(`${pluginBasePath(instance)}/trace/${trace.traceID}`);
  };

  if (!params.traceID) {
    return <TracePageSelectTrace instance={instance} setTraceID={changeCompareTrace} setTrace={handleUpload} />;
  }

  return (
    <Grid container={true} spacing={4}>
      <Grid item={true} xs={12} lg={options.compareTraceID ? 6 : 12}>
        {uploadedTrace ? (
          <TraceData instance={instance} traceData={uploadedTrace} />
        ) : (
          <TraceID instance={instance} traceID={params.traceID} />
        )}
      </Grid>

      {options.compareTraceID && (
        <Grid item={true} xs={12} lg={6}>
          <TraceID instance={instance} traceID={options.compareTraceID} />
        </Grid>
      )}
    </Grid>
  );
};

const TracesPageToolbar: FunctionComponent<{
  instance: IPluginInstance;
  options: ITracesPageOptions;
  setOptions: (options: ITracesPageOptions) => void;
}> = ({ instance, options, setOptions }) => {
  const [tags, setTags] = useState<string>(options.tags ?? '');

  /**
   * `changeOptions` is the function which is passed to the `Options` component, to call the `setOptions` function when
   * a user clicks on the search button, changes the selected time range or the additional options.
   */
  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined) => {
    if (additionalFields && additionalFields.length === 3) {
      setOptions({
        ...times,
        limit: additionalFields[0].value,
        maxDuration: additionalFields[1].value,
        minDuration: additionalFields[2].value,
        operation: options.operation,
        service: options.service,
        tags: tags,
      });
    }
  };

  /**
   * `handleSubmit` handles the submit of the toolbar
   */
  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setOptions({ ...options, tags: tags });
  };

  /**
   * `handleClear` is the action which is executed when a user clicks the clear button in the search field. When the
   * action is executed we set the search term to an empty string and we adjust the options accordingly.
   */
  const handleClear = () => {
    setTags('');
    setOptions({ ...options, tags: '' });
  };

  return (
    <Toolbar>
      <ToolbarItem grow={true}>
        <SelectService
          instance={instance}
          selectedService={options.service}
          selectService={(service) => setOptions({ ...options, service: service })}
        />
      </ToolbarItem>
      <ToolbarItem grow={true}>
        <SelectOperation
          instance={instance}
          service={options.service}
          selectedOperation={options.operation}
          selectOperation={(operation) => setOptions({ ...options, operation: operation })}
        />
      </ToolbarItem>
      <ToolbarItem grow={true}>
        <Box component="form" onSubmit={handleSubmit}>
          <TextField
            size="small"
            variant="outlined"
            placeholder="Tags"
            fullWidth={true}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton size="small" onClick={handleClear}>
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            value={tags}
            onChange={(e) => setTags(e.target.value)}
          />
        </Box>
      </ToolbarItem>
      <ToolbarItem align="right">
        <Options
          additionalFields={[
            {
              label: 'Limit',
              name: 'limit',
              placeholder: '20',
              value: options.limit,
            },
            {
              label: 'Max Duration',
              name: 'maxDuration',
              placeholder: '100ms',
              value: options.maxDuration,
            },
            {
              label: 'Min Duration',
              name: 'minDuration',
              placeholder: '100ms',
              value: options.minDuration,
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

const TracesPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  const [persistedOptions, setPersistedOptions] = useLocalStorageState<ITracesPageOptions>(
    'kobs-jaeger-tracespage-options',
    {
      limit: '20',
      maxDuration: '',
      minDuration: '',
      operation: '',
      service: '',
      tags: '',
      time: 'custom',
      timeEnd: 0,
      timeStart: 0,
    },
  );
  const [options, setOptions] = useQueryState<ITracesPageOptions>({
    limit: persistedOptions.limit,
    maxDuration: '',
    minDuration: '',
    operation: persistedOptions.operation,
    service: persistedOptions.service,
    tags: persistedOptions.tags,
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
  });

  /**
   * `useEffect` is used to persist the options, when they are changed by a user.
   */
  useEffect(() => {
    setPersistedOptions(options);
  }, [options, setPersistedOptions]);

  return (
    <Page
      title={instance.name}
      subtitle={`(${instance.cluster} / ${instance.type})`}
      description={instance.description || description}
      toolbar={<TracesPageToolbar instance={instance} options={options} setOptions={setOptions} />}
      actions={<JaegerPageActions instance={instance} />}
    >
      {!options.service ? (
        <Alert severity="info">
          <AlertTitle>Select a service</AlertTitle>
          You have to select a service to see the traces.
        </Alert>
      ) : (
        <Traces
          instance={instance}
          limit={options.limit}
          maxDuration={options.maxDuration}
          minDuration={options.minDuration}
          operation={options.operation}
          service={options.service}
          tags={options.tags}
          showChart={true}
          times={options}
        />
      )}
    </Page>
  );
};

const JaegerPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  return (
    <Routes>
      <Route path="/" element={<TracesPage instance={instance} />} />
      <Route path="/trace/" element={<TracePage instance={instance} />} />
      <Route path="/trace/:traceID" element={<TracePage instance={instance} />} />
      <Route path="/monitor" element={<MonitorPage instance={instance} />} />
    </Routes>
  );
};

export default JaegerPage;
