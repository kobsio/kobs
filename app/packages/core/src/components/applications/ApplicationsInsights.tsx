import { OpenInNew } from '@mui/icons-material';
import { Alert, Box, Grid, IconButton, Typography, useTheme } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext, useRef } from 'react';
import { Link } from 'react-router-dom';
import { VictoryArea, VictoryGroup } from 'victory';

import ApplicationLabels from './ApplicationLabels';

import { APIContext, APIError, IAPIContext } from '../../context/APIContext';
import { IApplication } from '../../crds/application';
import { IInsight } from '../../crds/application';
import { useDimensions } from '../../utils/hooks/useDimensions';
import { roundNumber } from '../../utils/numbers';
import { ITimes } from '../../utils/times';
import { DetailsDrawer } from '../utils/DetailsDrawer';
import { PluginPanel } from '../utils/PluginPanel';
import { UseQueryWrapper } from '../utils/UseQueryWrapper';

const getMappingValue = (value: number, mappings: Record<string, string>): string => {
  if (!value) {
    return '';
  }

  return mappings[value.toString()];
};

const InsightSparkline: FunctionComponent<{
  data: { x: Date; y: number }[];
  mappings?: Record<string, string>;
  times: ITimes;
  unit?: string;
}> = ({ data, unit, mappings, times }) => {
  const theme = useTheme();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const dimensions = useDimensions(wrapperRef);

  let label = 'N/A';
  if (data && data.length > 0) {
    if (mappings && Object.keys(mappings).length > 0) {
      label = getMappingValue(data[data.length - 1].y, mappings);
    } else {
      label =
        data[data.length - 1].y === null
          ? 'N/A'
          : `${roundNumber(data[data.length - 1].y as number)} ${unit ? unit : ''}`;
    }
  }

  return (
    <div style={{ height: '100px', position: 'relative' }}>
      <div style={{ height: '95px', width: '100%' }} ref={wrapperRef}>
        {dimensions.height > 0 && (
          <VictoryGroup
            color={theme.palette.primary.main}
            height={dimensions.height}
            padding={{ bottom: 0, left: 0, right: 0, top: 0 }}
            scale={{ x: 'time', y: 'linear' }}
            width={dimensions.width}
            domain={{ x: [new Date(times.timeStart * 1000), new Date(times.timeEnd * 1000)] }}
          >
            {data.length > 0 && (
              <VictoryArea
                data={data}
                interpolation="monotoneX"
                style={{
                  data: {
                    fillOpacity: 0.5,
                  },
                }}
              />
            )}
          </VictoryGroup>
        )}
      </div>
      {dimensions.height > 0 && (
        <div
          style={{
            fontSize: '24px',
            position: 'absolute',
            textAlign: 'center',
            top: `50px`,
            width: '100%',
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};

const Insight: FunctionComponent<{ insight: IInsight; times: ITimes }> = ({ insight, times }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<{ x: Date; y: number }[], APIError>(
    ['core/applications/insights', insight, times],
    async () => {
      const result = await apiContext.client.post<{ x: number; y: number }[]>(
        `/api/plugins/${insight.plugin.type}/insight?timeStart=${times.timeStart}&timeEnd=${times.timeEnd}`,
        {
          body: insight.plugin.options,
          headers: {
            'x-kobs-cluster': insight.plugin.cluster,
            'x-kobs-plugin': insight.plugin.name,
          },
        },
      );

      if (!result) {
        return [];
      }

      return result.map((datum) => {
        return { x: new Date(datum.x), y: datum.y };
      });
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load insights"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || data.length === 0}
      noDataTitle="No data was found"
      refetch={refetch}
    >
      {insight.type === 'sparkline' ? (
        <InsightSparkline data={data ?? []} unit={insight.unit} mappings={insight.mappings} times={times} />
      ) : (
        <Alert severity="warning">Invalid insight type: {insight.type}</Alert>
      )}
    </UseQueryWrapper>
  );
};

const Insights: FunctionComponent<{
  application: IApplication;
  direction: 'row' | 'column';
  times: ITimes;
}> = ({ application, direction, times }) => {
  const insightsCount = application.insights?.length ?? 0;

  return (
    <Grid container={true} spacing={4}>
      {application.insights?.map((insight, index) => (
        <Grid key={index} item={true} xs={12} md={direction === 'column' ? 12 : Math.max(12 / insightsCount, 3)}>
          <PluginPanel title={insight.title}>
            <Insight insight={insight} times={times} />
          </PluginPanel>
        </Grid>
      ))}
    </Grid>
  );
};

/**
 * The `ApplicationInsightsDrawer` component is responsible for rendering the insights of an application in a drawer.
 * Next to the insight charts we also render the labels (tags, teams, dependencies and link) in this component.
 */
export const ApplicationInsightsDrawer: FunctionComponent<{
  application: IApplication;
  onClose: () => void;
  open: boolean;
}> = ({ application, onClose, open }) => {
  return (
    <DetailsDrawer
      size="small"
      open={open}
      onClose={onClose}
      title={application.name}
      subtitle={
        application.topology && application.topology.external === true
          ? ''
          : `(${application.cluster} / ${application.namespace})`
      }
      actions={
        <IconButton edge="end" color="inherit" sx={{ mr: 1 }} component={Link} to={`/applications${application.id}`}>
          <OpenInNew />
        </IconButton>
      }
    >
      <Box>
        {application.description && (
          <Typography color="text.primary" variant="body1" pb={6}>
            {application.description}
          </Typography>
        )}
        <ApplicationLabels application={application} />
      </Box>

      <Box sx={{ py: 6 }}>
        <Insights
          application={application}
          direction="column"
          times={{
            time: 'last15Minutes',
            timeEnd: Math.floor(Date.now() / 1000),
            timeStart: Math.floor(Date.now() / 1000) - 900,
          }}
        />
      </Box>
    </DetailsDrawer>
  );
};

/**
 * The `ApplicationInsightsPanel` can be used to render the application insights within a panel in a dashboard. In
 * opposite to the `ApplicationInsightsDrawer` component, we don't render the labels (tags, teams, dependencies and
 * links), but only the insights (charts).
 */
export const ApplicationInsightsPanel: FunctionComponent<{
  options: { cluster: string; direction: string; name: string; namespace: string };
  times: ITimes;
}> = ({ options, times }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IApplication, APIError>(
    ['core/applications/application', options.cluster, options.namespace, options.name],
    async () => {
      return apiContext.client.get<IApplication>(
        `/api/applications/application?id=${encodeURIComponent(
          `/cluster/${options.cluster}/namespace/${options.namespace}/name/${options.name}`,
        )}`,
      );
    },
  );

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load application"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data}
      noDataTitle="Application not found"
      noDataMessage="The requested application was not found"
      refetch={refetch}
    >
      {data && <Insights application={data} direction={options.direction === 'row' ? 'row' : 'column'} times={times} />}
    </UseQueryWrapper>
  );
};
