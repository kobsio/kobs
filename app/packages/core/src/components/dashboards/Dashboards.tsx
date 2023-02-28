import { Box, Card, Divider, FormControl, InputLabel, MenuItem, Select, Tab, Tabs, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Fragment, FunctionComponent, useContext, useMemo, useState } from 'react';
import { WidthProvider, Responsive } from 'react-grid-layout';

import { getVariableViaPlugin, interpolate, interpolateJSONPath } from './utils';

import { APIContext, APIError, IAPIContext } from '../../context/APIContext';
import { IDashboard, IPanel, IReference, IRow, IVariableValues } from '../../crds/dashboard';
import useQueryState from '../../utils/hooks/useQueryState';
import { ITimes, timeOptions, times as defaultTimes, TTime } from '../../utils/times';
import { IOptionsAdditionalFields, Options } from '../utils/Options';
import { Toolbar, ToolbarItem } from '../utils/Toolbar';
import UseQueryWrapper from '../utils/UseQueryWrapper';

import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

/**
 * The `IDashboardGridProps` is the interface for the `DashboardGrid` component, which requires a list of `panels`.
 */
interface IDashboardGridProps {
  panels: IPanel[];
}

/**
 * The `DashboardGrid` component is used to render a list of `panels` in a responsive grid layout. We are using the
 * `react-grid-layout` package to render the grid, so that a user can also drage and resize the panels in the app.
 */
const DashboardGrid: FunctionComponent<IDashboardGridProps> = ({ panels }: IDashboardGridProps) => {
  const [layouts, setLayouts] = useState<ReactGridLayout.Layouts>();

  const ResponsiveReactGridLayout = useMemo(() => WidthProvider(Responsive), []);

  return (
    <ResponsiveReactGridLayout
      breakpoints={{ md: 925, sm: 600 }}
      cols={{ md: 12, sm: 1 }}
      rowHeight={32}
      margin={[16, 16]}
      containerPadding={[0, 0]}
      layouts={layouts}
      onLayoutChange={(_, layouts) => setLayouts(layouts)}
    >
      {panels.map((panel, panelIndex) => (
        <div
          key={panel.title}
          data-grid={{
            h: panel.h ?? 0,
            isBounded: true,
            static: true,
            w: panel.w ?? 0,
            x: panel.x ?? 0,
            y: panel.y ?? 0,
          }}
        >
          <Card sx={{ height: '100%', width: '100%' }}>
            {panel.title}
            {panel.description}
          </Card>
        </div>
      ))}
    </ResponsiveReactGridLayout>
  );
};

/**
 * The `IDashboardToolbarVariableProps` is the interface for the properties of the `DashboardToolbarVariable` component.
 * To render the component we need a `variable` and a function which is triggered when the `variabel` value is changed.
 */
interface IDashboardToolbarVariableProps {
  selectValue: (value: string) => void;
  variable: IVariableValues;
}

/**
 * The `DashboardToolbarVariable` renders a select box for the provided `variable`. When a user selects a value in the
 * select box we trigger the `selectValue` function with the selected value to reflect the users change in the
 * dashboard.
 */
const DashboardToolbarVariable: FunctionComponent<IDashboardToolbarVariableProps> = ({
  variable,
  selectValue,
}: IDashboardToolbarVariableProps) => {
  return (
    <FormControl size="small" fullWidth={true}>
      <InputLabel id={variable.name}>{variable.label}</InputLabel>
      <Select
        labelId={variable.name}
        label={variable.label}
        value={variable.value}
        onChange={(e): void => selectValue(e.target.value)}
      >
        {variable.values.map((value) => (
          <MenuItem key={value} value={value}>
            {value}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

/**
 * The `IDashboardToolbarProps` is the interface for the `DashboardToolbar` component.
 */
interface IDashboardToolbarProps {
  setTimes: (times: ITimes) => void;
  setVariables: (variables: IVariableValues[]) => void;
  times: ITimes;
  variables: IVariableValues[];
}

/**
 * The `DashboardToolbar` component renders the toolbar for a dashboard. The toolbar shows all variables for the
 * dashboard and the `Options` component to let the user select a time range and to refresh the currently selected time
 * range.
 */
const DashboardToolbar: FunctionComponent<IDashboardToolbarProps> = ({ setTimes, setVariables, times, variables }) => {
  const selectValue = (index: number, value: string): void => {
    const tmpVariables = [...variables];
    tmpVariables[index].value = value;
    setVariables(tmpVariables);
  };

  const changeOptions = (times: ITimes, additionalFields: IOptionsAdditionalFields[] | undefined): void => {
    setTimes(times);
  };

  return (
    <Card sx={{ p: 4 }}>
      <Toolbar>
        {variables.map((variable, index) =>
          variable.hide ? null : (
            <ToolbarItem key={variable.name} width="250px">
              <DashboardToolbarVariable
                variable={variable}
                selectValue={(value: string): void => selectValue(index, value)}
              />
            </ToolbarItem>
          ),
        )}

        <Options times={times} showOptions={true} showSearchButton={false} setOptions={changeOptions} />
      </Toolbar>
    </Card>
  );
};

/**
 * `IDashboardProps` is the interface for the `Dashboard` component.
 */
interface IDashboardProps {
  dashboard: IDashboard;
}

/**
 * The `Dashboard` component is used to render a single dashboard. To render the dashboard we have to:
 * - Fetch all values for the variables in the provided dashboard
 * - Maintain the user selected time range
 * - Interpolate all variables in the dashboard with their current value
 */
const Dashboard: FunctionComponent<IDashboardProps> = ({ dashboard }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const [times, setTimes] = useState<ITimes>({
    time:
      dashboard.defaultTime && dashboard.defaultTime in timeOptions
        ? (dashboard.defaultTime as TTime)
        : 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart:
      Math.floor(Date.now() / 1000) -
      (dashboard.defaultTime && defaultTimes.includes(dashboard.defaultTime)
        ? timeOptions[dashboard.defaultTime].seconds
        : 900),
  });

  const [variables, setVariables] = useState<IVariableValues[] | undefined>(() =>
    dashboard.variables?.map((variable) => {
      return {
        ...variable,
        value: '',
        values: [],
      };
    }),
  );

  const { data } = useQuery<IVariableValues[] | null, Error>(
    ['core/dashboards/variables', dashboard, variables, times],
    async () => {
      if (!variables) {
        return [];
      }

      try {
        const tmpVariables = [...variables];

        for (let i = 0; i < tmpVariables.length; i++) {
          if (tmpVariables[i].plugin.type === 'core') {
            if (tmpVariables[i].plugin.name === 'static') {
              if (tmpVariables[i].plugin.options && Array.isArray(tmpVariables[i].plugin.options)) {
                tmpVariables[i].values = tmpVariables[i].plugin.options;
                tmpVariables[i].value = tmpVariables[i].value || tmpVariables[i].plugin.options[0];
              }
            }

            if (tmpVariables[i].plugin.name === 'placeholder') {
              if (tmpVariables[i].plugin.options) {
                tmpVariables[i].values = [tmpVariables[i].plugin.options.value || ''];
                tmpVariables[i].value = tmpVariables[i].plugin.options.value || '';
              }
            }
          } else {
            tmpVariables[i] = await getVariableViaPlugin(apiContext.client, tmpVariables[i], tmpVariables, times);
          }
        }

        return tmpVariables;
      } catch (err) {
        throw err;
      }
    },
    { cacheTime: 0, keepPreviousData: true },
  );

  const rows: IRow[] | undefined = JSON.parse(interpolate(JSON.stringify(dashboard.rows), data ? data : [], times));

  return (
    <>
      {dashboard.hideToolbar === true ? null : (
        <DashboardToolbar variables={data ?? []} setVariables={setVariables} times={times} setTimes={setTimes} />
      )}
      <Box
        pt={6}
        sx={(theme) => ({
          '.react-grid-item.react-grid-placeholder': {
            backgroundColor: 'background.paper',
          },
        })}
      >
        {rows?.map((row, rowIndex) => (
          <Fragment key={rowIndex}>
            {row.title ? (
              <Typography variant="h6" pb={4} pt={rowIndex === 0 ? 0 : 4}>
                {row.title}
              </Typography>
            ) : null}
            {row.panels && row.panels.length > 0 ? <DashboardGrid panels={row.panels} /> : null}
          </Fragment>
        ))}
      </Box>
    </>
  );
};

/**
 * `IDashboardsProps` is the interface for the properties of the `Dashboard` component. To use the component we need
 * a `manifest` (JSON representation of a application, team, user or Kubernetes resource) and a list of dashboard
 * references, which will be shown in the dashboard.
 */
interface IDashboardsProps {
  manifest: unknown;
  references: IReference[];
}

/**
 * The `Dashboards` component is responsible for loading all dashboards based on the provided `references`. Within the
 * API call to get the dashboards we will also add all placeholders as variables to the dashboard, so that we do not to
 * make a difference later in the variable handling. After the dashboards were loaded we will also replace all JSONPath
 * occurences with the correct value from the provided `manifest`.
 */
const Dashboards: FunctionComponent<IDashboardsProps> = ({ manifest, references }) => {
  const apiContext = useContext<IAPIContext>(APIContext);
  const [selectedDashboard, setSelectedDashboard] = useQueryState<{ title: string }>();

  const { isError, isLoading, error, data, refetch } = useQuery<IDashboard[], APIError>(
    ['core/dashboards/dashboards', references, manifest],
    async () => {
      const dashboards = await apiContext.client.post<IDashboard[]>('/api/dashboards', {
        body: references,
      });
      if (dashboards && dashboards.length > 0) {
        return JSON.parse(interpolateJSONPath(JSON.stringify(dashboards), manifest));
      }
      return dashboards;
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load dashboards"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || data.length === 0}
      noDataTitle="No dashboards were found"
      noDataMessage="No dashboards were found for this resource."
      refetch={refetch}
    >
      {data && data.length === 1 ? (
        <>
          <Divider />
          <Box sx={{ pt: 6 }}>
            <Dashboard dashboard={data[0]} />
          </Box>
        </>
      ) : (
        <>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              variant="scrollable"
              scrollButtons={false}
              value={selectedDashboard.title ?? data?.[0].title}
              onChange={(_, value) => setSelectedDashboard({ title: value })}
            >
              {data?.map((dashboard) => (
                <Tab key={dashboard.title} label={dashboard.title} value={dashboard.title} />
              ))}
            </Tabs>
          </Box>
          {data?.map((dashboard) => (
            <Box key={dashboard.title} hidden={dashboard.title !== selectedDashboard.title} sx={{ pt: 6 }}>
              {dashboard.title === selectedDashboard.title && <Dashboard key={dashboard.title} dashboard={dashboard} />}
            </Box>
          ))}
        </>
      )}
    </UseQueryWrapper>
  );
};

export default Dashboards;