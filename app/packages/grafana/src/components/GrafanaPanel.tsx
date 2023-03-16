import {
  APIContext,
  APIError,
  IAPIContext,
  IPluginInstance,
  IPluginPanelProps,
  ITimes,
  PluginPanel,
  PluginPanelError,
  UseQueryWrapper,
} from '@kobsio/core';
import { Divider, List, ListItem, ListItemText, Typography } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Fragment, FunctionComponent, useContext } from 'react';
import { Link } from 'react-router-dom';

import { IDashboard } from '../utils/utils';

interface IOptions {
  dashboards?: string[];
  panel?: IPanelOptions;
  type?: string;
}

export interface IPanelOptions {
  dashboardID?: string;
  panelID?: string;
  variables?: Record<string, string>;
}

const getVars = (dashboardID: string, dashboardIDs: string[]): string => {
  for (const id of dashboardIDs) {
    if (id.startsWith(dashboardID)) {
      return id.replace(dashboardID, '');
    }
  }

  return '';
};

const Panel: FunctionComponent<{
  dashboardID: string;
  instance: IPluginInstance;
  panelID: string;
  times: ITimes;
  title: string;
  variables?: Record<string, string>;
}> = ({ instance, title, dashboardID, panelID, variables, times }) => {
  const variableParams = variables
    ? Object.keys(variables)
        .map((key) => `${key}=${variables[key]}`)
        .join('&')
    : '';

  return (
    <div>
      <iframe
        style={{ border: 'none', height: '100%', width: '100%' }}
        title={title}
        src={`${instance.options?.address}/d-solo/${dashboardID}?from=${times.timeStart * 1000}&to=${
          times.timeEnd * 1000
        }&theme=dark&panelId=${panelID}&${variableParams}`}
      ></iframe>
    </div>
  );
};

const Dashboards: FunctionComponent<{ dashboardIDs: string[]; instance: IPluginInstance }> = ({
  instance,
  dashboardIDs,
}) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IDashboard[], APIError>(
    ['grafana/dashboards', instance, dashboardIDs],
    async () => {
      const uidParams = dashboardIDs
        .map(
          (dashboardID) =>
            `uid=${
              dashboardID.lastIndexOf('?') > -1 ? dashboardID.substring(0, dashboardID.lastIndexOf('?')) : dashboardID
            }`,
        )
        .join('&');

      return apiContext.client.get<IDashboard[]>(`/api/plugins/grafana/dashboards?${uidParams}`, {
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
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
      noDataMessage="No dashboards were found for the provided uids"
      refetch={refetch}
    >
      <List sx={{ bgcolor: 'background.paper' }} disablePadding={true}>
        {data
          ?.filter((dashboard) => dashboard.type !== 'dash-folder')
          .map((dashboard, index) => (
            <Fragment key={dashboard.id}>
              <ListItem
                sx={{ color: 'inherit', cursor: 'pointer', textDecoration: 'inherit' }}
                component={Link}
                to={`${instance.options?.address}${dashboard.url}${getVars(dashboard.uid, dashboardIDs)}`}
                target="_blank"
              >
                <ListItemText
                  primary={
                    <Typography variant="h6">
                      {dashboard.title}
                      {dashboard.folderTitle && (
                        <Typography pl={2} color="text.secondary" variant="caption">
                          {dashboard.folderTitle}
                        </Typography>
                      )}
                    </Typography>
                  }
                />
              </ListItem>
              {index + 1 !== data?.length && <Divider component="li" />}
            </Fragment>
          ))}
      </List>
    </UseQueryWrapper>
  );
};

const GrafanaPanel: FunctionComponent<IPluginPanelProps<IOptions>> = ({
  title,
  description,
  options,
  instance,
  times,
}) => {
  if (
    options &&
    options.type === 'panel' &&
    options.panel &&
    options.panel.dashboardID &&
    options.panel.panelID &&
    times
  ) {
    return (
      <Panel
        instance={instance}
        title={title}
        dashboardID={options.panel.dashboardID}
        panelID={options.panel.panelID}
        variables={options.panel.variables}
        times={times}
      />
    );
  }

  if (
    options &&
    options.type === 'dashboards' &&
    options.dashboards &&
    Array.isArray(options.dashboards) &&
    options.dashboards.length > 0
  ) {
    return (
      <PluginPanel title={title} description={description}>
        <Dashboards instance={instance} dashboardIDs={options.dashboards} />
      </PluginPanel>
    );
  }

  return (
    <PluginPanelError
      title={title}
      description={description}
      message="Invalid options for Grafana plugin"
      details="One of the required options is missing."
      example={`plugin:
  name: grafana
  type: grafana
  options:
    type: dashboards
    dashboards:
      - aNBJWNtGk`}
      documentation="https://kobs.io/main/plugins/grafana"
    />
  );
};

export default GrafanaPanel;
