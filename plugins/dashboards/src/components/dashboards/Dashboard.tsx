import { Alert, AlertActionLink, AlertVariant, Grid, GridItem, Spinner, Title } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { useContext, useEffect, useRef, useState } from 'react';

import {
  ClustersContext,
  IClusterContext,
  IPluginDefaults,
  IPluginTimes,
  IPluginsContext,
  PluginPanel,
  PluginsContext,
  useWindowWidth,
} from '@kobsio/plugin-core';
import { IDashboard, IRow, IVariableValues } from '../../utils/interfaces';
import { interpolate, rowHeight, toGridSpans } from '../../utils/dashboard';
import DashboardToolbar from './DashboardToolbar';

interface IDashboardProps {
  defaults: IPluginDefaults;
  dashboard: IDashboard;
  showDetails?: (details: React.ReactNode) => void;
}

// The Dashboard component renders the rows and panels for a single dashboard, by including a plugin via the PluginPanel
// component.
// The component is also used to set the initial value for the times and for fetching all defined variable values. To
// allow a user to change the time or select another variable value the component includes a toolbar component.
const Dashboard: React.FunctionComponent<IDashboardProps> = ({ defaults, dashboard, showDetails }: IDashboardProps) => {
  const clustersContext = useContext<IClusterContext>(ClustersContext);
  const pluginsContext = useContext<IPluginsContext>(PluginsContext);

  // width, refGrid and forceDefaultSpan are used to determine the current width of the dashboard (this isn't always the
  // screen width, because the dashboard can also be used in a panel), so that we can adjust the size of the rows and
  // columns in the grid.
  const width = useWindowWidth();
  const refGrid = useRef<HTMLDivElement>(null);
  const [forceDefaultSpan, setForceDefaultSpan] = useState<boolean>(false);

  // times is the state for the users selected time. The default value will always be the last 15 minutes. This is
  // required for some plugins (e.g. the Prometheus plugin), which making use of a time range.
  const [times, setTimes] = useState<IPluginTimes>({
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
  });

  // variables is the state for the dashboard variables. The initial state is undefined or when the user provided some
  // variables we convert them to the IVariableValues interface which contains the currently selected value and all
  // possible values.
  const [variables, setVariables] = useState<IVariableValues[] | undefined>(
    dashboard.variables?.map((variable) => {
      return {
        ...variable,
        value: '',
        values: [],
      };
    }),
  );

  // Everytime the variables state is changed we run the following query to refetch the variable values. This also means
  // that all child components should used the retunred data array instead of the formerly defined variables state,
  // because it contains the current values and selected value for a variable. The variables state is mainly there to
  // trigger this function everytime a new variable value is selected.
  const { isError, error, data, refetch } = useQuery<IVariableValues[], Error>(
    ['dashboard/variables', variables],
    async () => {
      if (!variables) {
        return [];
      }

      try {
        const tmpVariables = [...variables];

        for (let i = 0; i < tmpVariables.length; i++) {
          if (tmpVariables[i].plugin.name === 'core') {
            if (tmpVariables[i].plugin.options.type) {
              if (tmpVariables[i].plugin.options.type === 'clusters') {
                tmpVariables[i].values = clustersContext.clusters;
                tmpVariables[i].value = tmpVariables[i].value || tmpVariables[i].values[0];
              } else if (tmpVariables[i].plugin.options.type === 'plugins') {
                tmpVariables[i].values = pluginsContext.plugins.map((plugin) => plugin.name);
                tmpVariables[i].value = tmpVariables[i].value || tmpVariables[i].values[0];
              } else if (tmpVariables[i].plugin.options.type === 'static') {
                if (tmpVariables[i].plugin.options.items && Array.isArray(tmpVariables[i].plugin.options.items)) {
                  tmpVariables[i].values = tmpVariables[i].plugin.options.items;
                  tmpVariables[i].value = tmpVariables[i].value || tmpVariables[i].plugin.options.items[0];
                }
              }
            }
          }
        }

        return tmpVariables;
      } catch (err) {
        throw err;
      }
    },
  );

  // useEffect is executed every time the window width changes, to determin the size of the grid and use a static span
  // size of 12 if necessary. We have to use the with of the grid instead of the window width, because it is possible
  // that the chart is rendered in a drawer (e.g. for applications in the applications page).
  useEffect(() => {
    if (refGrid && refGrid.current) {
      if (refGrid.current.getBoundingClientRect().width >= 1200) {
        setForceDefaultSpan(false);
      } else {
        setForceDefaultSpan(true);
      }
    }
  }, [width]);

  // We do not use the dashboard.rows array directly to render the dashboard. Instead we are replacing all the variables
  // in the dashboard first with users selected values. For that we have to convert the array to a string first so that
  // we can replace the variables in the string and then we have to convert it back to an array,
  const rows: IRow[] = data ? JSON.parse(interpolate(JSON.stringify(dashboard.rows), data)) : dashboard.rows;

  return (
    <div ref={refGrid}>
      {isError ? (
        <Alert
          variant={AlertVariant.danger}
          title="Applications were not fetched"
          actionLinks={
            <React.Fragment>
              <AlertActionLink onClick={(): Promise<QueryObserverResult<IVariableValues[], Error>> => refetch()}>
                Retry
              </AlertActionLink>
            </React.Fragment>
          }
        >
          <p>{error?.message}</p>
        </Alert>
      ) : !data ? (
        <div className="pf-u-text-align-center">
          <Spinner />
        </div>
      ) : (
        <React.Fragment>
          <DashboardToolbar variables={data} setVariables={setVariables} times={times} setTimes={setTimes} />

          <p>&nbsp;</p>

          <Grid hasGutter={true}>
            {rows.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                {row.title ? (
                  <Title headingLevel="h6" size="lg">
                    {row.title}
                  </Title>
                ) : null}
                {row.panels.map((panel, panelIndex) => (
                  <GridItem
                    key={panelIndex}
                    span={toGridSpans(12, forceDefaultSpan, panel.colSpan)}
                    rowSpan={toGridSpans(1, forceDefaultSpan, panel.rowSpan)}
                  >
                    <div
                      style={
                        row.size !== undefined && row.size === -1
                          ? undefined
                          : { height: rowHeight(row.size, panel.rowSpan), overflow: 'scroll' }
                      }
                    >
                      <PluginPanel
                        defaults={defaults}
                        times={times}
                        title={panel.title}
                        description={panel.description}
                        name={panel.plugin.name}
                        options={panel.plugin.options}
                        showDetails={showDetails}
                      />
                    </div>
                  </GridItem>
                ))}
              </React.Fragment>
            ))}
          </Grid>
        </React.Fragment>
      )}
    </div>
  );
};

export default Dashboard;
