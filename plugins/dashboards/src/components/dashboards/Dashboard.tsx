import { Alert, AlertActionLink, AlertVariant, Grid, GridItem, Spinner, Title } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React, { memo, useContext, useState } from 'react';
import { InView } from 'react-intersection-observer';

import {
  ClustersContext,
  IClusterContext,
  IDashboard,
  IDashboardRow,
  IDashboardVariableValues,
  IPluginTimes,
  IPluginsContext,
  PluginPanel,
  PluginsContext,
  interpolate,
} from '@kobsio/plugin-core';
import { rowHeight, toGridSpans } from '../../utils/dashboard';
import DashboardToolbar from './DashboardToolbar';

interface IDashboardProps {
  activeKey: string;
  eventKey: string;
  dashboard: IDashboard;
  forceDefaultSpan: boolean;
  setDetails?: (details: React.ReactNode) => void;
}

// The Dashboard component renders the rows and panels for a single dashboard, by including a plugin via the PluginPanel
// component.
// The component is also used to set the initial value for the times and for fetching all defined variable values. To
// allow a user to change the time or select another variable value the component includes a toolbar component.
const Dashboard: React.FunctionComponent<IDashboardProps> = ({
  activeKey,
  eventKey,
  dashboard,
  forceDefaultSpan,
  setDetails,
}: IDashboardProps) => {
  const clustersContext = useContext<IClusterContext>(ClustersContext);
  const pluginsContext = useContext<IPluginsContext>(PluginsContext);

  // times is the state for the users selected time. The default value will always be the last 15 minutes. This is
  // required for some plugins (e.g. the Prometheus plugin), which making use of a time range.
  const [times, setTimes] = useState<IPluginTimes>({
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
  });

  // variables is the state for the dashboard variables. The initial state is undefined or when the user provided some
  // variables we convert them to the IDashboardVariableValues interface which contains the currently selected value and
  // all possible values.
  const [variables, setVariables] = useState<IDashboardVariableValues[] | undefined>(
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
  // Currently we support "core" variable, which can be used to select a cluster or plugin and we are supporting the
  // Prometheus plugin. For the Prometheus plugin the user must specify the name of the Prometheus instance via the name
  // parameter in the options. When the user changes the variables, we keep the old variable values, so that we not have
  // to rerender all the panels in the dashboard.
  const { isError, error, data, refetch } = useQuery<IDashboardVariableValues[] | null, Error>(
    ['dashboard/variables', dashboard, variables, times, activeKey],
    async () => {
      if (activeKey !== eventKey) {
        return null;
      }

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
          } else {
            const pluginDetails = pluginsContext.getPluginDetails(tmpVariables[i].plugin.name);
            const variablesFunc =
              pluginDetails && pluginsContext.components.hasOwnProperty(pluginDetails.type)
                ? pluginsContext.components[pluginDetails.type].variables
                : undefined;

            if (variablesFunc) {
              tmpVariables[i] = await variablesFunc(tmpVariables[i], tmpVariables, times);
            }
          }
        }

        return tmpVariables;
      } catch (err) {
        throw err;
      }
    },
    { keepPreviousData: true },
  );

  // We do not use the dashboard.rows array directly to render the dashboard. Instead we are replacing all the variables
  // in the dashboard first with users selected values. For that we have to convert the array to a string first so that
  // we can replace the variables in the string and then we have to convert it back to an array,
  const rows: IDashboardRow[] = JSON.parse(interpolate(JSON.stringify(dashboard.rows), data ? data : [], times));

  if (isError) {
    return (
      <Alert
        variant={AlertVariant.danger}
        title="Variables were not fetched"
        actionLinks={
          <React.Fragment>
            <AlertActionLink
              onClick={(): Promise<QueryObserverResult<IDashboardVariableValues[] | null, Error>> => refetch()}
            >
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data) {
    return (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );
  }

  return (
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
                <InView>
                  {({ inView, ref }): React.ReactNode => (
                    <div ref={ref}>
                      {inView ? (
                        <div
                          style={
                            row.size !== undefined && row.size === -1
                              ? undefined
                              : { height: rowHeight(row.size, panel.rowSpan), overflow: 'scroll' }
                          }
                        >
                          <PluginPanel
                            times={times}
                            title={panel.title}
                            description={panel.description}
                            name={panel.plugin.name}
                            options={panel.plugin.options}
                            setDetails={setDetails}
                          />
                        </div>
                      ) : (
                        <div
                          style={
                            row.size !== undefined && row.size === -1
                              ? undefined
                              : { height: rowHeight(row.size, panel.rowSpan), overflow: 'scroll' }
                          }
                        ></div>
                      )}
                    </div>
                  )}
                </InView>
              </GridItem>
            ))}
          </React.Fragment>
        ))}
      </Grid>
    </React.Fragment>
  );
};

export default memo(Dashboard, (prevProps, nextProps) => {
  if (
    prevProps.activeKey === nextProps.activeKey &&
    JSON.stringify(prevProps.dashboard) === JSON.stringify(nextProps.dashboard) &&
    prevProps.forceDefaultSpan === nextProps.forceDefaultSpan
  ) {
    return true;
  }

  return false;
});
