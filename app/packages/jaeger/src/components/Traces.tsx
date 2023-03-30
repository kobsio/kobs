import {
  APIContext,
  APIError,
  ChartTooltip,
  chartTheme,
  chartTickFormatValue,
  DetailsDrawer,
  IAPIContext,
  IPluginInstance,
  ITimes,
  useDimensions,
  UseQueryWrapper,
} from '@kobsio/core';
import { Error } from '@mui/icons-material';
import { Box, Card, Chip, Divider, List, ListItem, ListItemText, Stack, Typography, useTheme } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Fragment, FunctionComponent, useContext, useMemo, useRef, useState } from 'react';
import { VictoryChart, VictoryAxis, VictoryVoronoiContainer, VictoryScatter } from 'victory';

import { Spans } from './Spans';
import { TraceActions } from './Trace';

import {
  doesTraceContainsError,
  encodeTags,
  formatTraceTime,
  getColors,
  ITrace,
  transformTraceData,
} from '../utils/utils';

const TraceDetails: FunctionComponent<{
  colors: Record<string, string>;
  instance: IPluginInstance;
  onClose: () => void;
  open: boolean;
  trace: ITrace;
}> = ({ instance, colors, trace, open, onClose }) => {
  return (
    <DetailsDrawer
      size="large"
      open={open}
      onClose={onClose}
      title={trace.traceName}
      subtitle={trace.traceID}
      actions={<TraceActions instance={instance} trace={trace} isDrawerAction={true} />}
    >
      <>
        <span>
          <Typography component="span" color="text.secondary">
            Trace Start:
          </Typography>
          <Typography component="span" fontWeight="bold" sx={{ pl: 2, pr: 4 }}>
            {formatTraceTime(trace.startTime)}
          </Typography>
        </span>
        <span>
          <Typography component="span" color="text.secondary">
            Duration:
          </Typography>
          <Typography component="span" fontWeight="bold" sx={{ pl: 2, pr: 4 }}>
            {trace.duration / 1000}ms
          </Typography>
        </span>
        <span>
          <Typography component="span" color="text.secondary">
            Services:
          </Typography>
          <Typography component="span" fontWeight="bold" sx={{ pl: 2, pr: 4 }}>
            {trace.services.length}
          </Typography>
        </span>
        <span>
          <Typography component="span" color="text.secondary">
            Total Spans:
          </Typography>
          <Typography component="span" fontWeight="bold" sx={{ pl: 2, pr: 4 }}>
            {trace.spans.length}
          </Typography>
        </span>

        <Box sx={{ bgcolor: 'background.paper', height: 'calc(100vh - 64px - 48px - 8px)', mt: 4, p: 4 }}>
          <Spans instance={instance} colors={colors} trace={trace} />
        </Box>
      </>
    </DetailsDrawer>
  );
};

const Trace: FunctionComponent<{ colors: Record<string, string>; instance: IPluginInstance; trace: ITrace }> = ({
  instance,
  colors,
  trace,
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ListItem
        sx={{ cursor: 'pointer' }}
        onClick={() => setOpen(true)}
        secondaryAction={doesTraceContainsError(trace) ? <Error color="error" /> : undefined}
      >
        <ListItemText
          primary={
            <Stack direction="row" justifyContent="space-between">
              <Typography variant="h6">
                {trace.traceName}

                <Typography pl={2} color="text.secondary" variant="caption">
                  {trace.traceID}
                </Typography>
              </Typography>

              <Box>{trace.duration / 1000}ms</Box>
            </Stack>
          }
          secondaryTypographyProps={{ component: 'div' }}
          secondary={
            <Stack direction="row" justifyContent="space-between">
              <Stack direction="row" spacing={4}>
                <Chip size="small" label={`${trace.spans.length} Span${trace.spans.length !== 1 ? 's' : ''}`} />
                <Stack direction="row" spacing={2}>
                  {trace.services.map((service, index) => (
                    <Chip
                      key={index}
                      size="small"
                      sx={{ backgroundColor: colors[service.name] }}
                      label={`${service.name} (${service.numberOfSpans})`}
                    />
                  ))}
                </Stack>
              </Stack>
              <Box>{formatTraceTime(trace.startTime)}</Box>
            </Stack>
          }
        />
      </ListItem>

      <TraceDetails instance={instance} colors={colors} trace={trace} open={open} onClose={() => setOpen(false)} />
    </>
  );
};

interface IDatum {
  hasError: boolean;
  name: string;
  trace: ITrace;
  x: Date;
  y: number;
  z: number;
}

const TracesChart: FunctionComponent<{
  colors: Record<string, string>;
  instance: IPluginInstance;
  traces: ITrace[];
}> = ({ instance, colors, traces }) => {
  const theme = useTheme();
  const refChart = useRef<HTMLDivElement>(null);
  const chartSize = useDimensions(refChart);
  const [selectedTrace, setSelectedTrace] = useState<ITrace | undefined>(undefined);

  const { data } = useMemo<{ data: IDatum[] }>(() => {
    const result: IDatum[] = [];

    traces.forEach((trace, index) => {
      result.push({
        hasError: doesTraceContainsError(trace),
        name: trace.traceName,
        trace: trace,
        x: new Date(Math.floor(trace.spans[0].startTime / 1000)),
        y: trace.duration / 1000,
        z: trace.spans.length,
      });
    });

    return {
      data: result.sort((a, b) => (a.x.valueOf() as number) - (b.x.valueOf() as number)),
    };
  }, [traces]);

  return (
    <Card sx={{ mb: 6, p: 2 }}>
      <div style={{ height: '250px' }} ref={refChart}>
        <VictoryChart
          theme={chartTheme(theme)}
          containerComponent={
            <VictoryVoronoiContainer
              labels={() => ' '}
              labelComponent={
                <ChartTooltip
                  height={chartSize.height}
                  width={chartSize.width}
                  legendData={({ datum }: { datum: IDatum }) => ({
                    color: datum.hasError ? theme.palette.error.main : theme.palette.primary.main,
                    label: datum.name,
                    title: formatTraceTime(datum.x.getTime() * 1000),
                    unit: 'ms',
                    value: datum.y,
                  })}
                />
              }
              mouseFollowTooltips={true}
            />
          }
          height={chartSize.height}
          padding={{ bottom: 25, left: 60, right: 0, top: 0 }}
          scale={{ x: 'time', y: 'linear' }}
          width={chartSize.width}
        >
          <VictoryAxis dependentAxis={true} label="ms" tickFormat={chartTickFormatValue} />
          <VictoryAxis dependentAxis={false} />
          <VictoryScatter
            style={{
              data: {
                fill: ({ datum }) => (datum.hasError ? theme.palette.error.main : theme.palette.primary.main),
              },
            }}
            events={[
              {
                eventHandlers: {
                  onClick: () => {
                    return [
                      {
                        mutation: ({
                          datum,
                        }: {
                          datum: { hasError: boolean; name: string; trace: ITrace; x: Date; y: number; z: number };
                        }) => {
                          setSelectedTrace(datum.trace);
                        },
                        target: 'data',
                      },
                    ];
                  },
                },
                target: 'data',
              },
            ]}
            data={data}
            bubbleProperty="z"
            maxBubbleSize={25}
            minBubbleSize={10}
            size={1}
          />
        </VictoryChart>
      </div>

      {selectedTrace && (
        <TraceDetails
          instance={instance}
          colors={colors}
          trace={selectedTrace}
          open={selectedTrace !== undefined}
          onClose={() => setSelectedTrace(undefined)}
        />
      )}
    </Card>
  );
};

export const Traces: FunctionComponent<{
  instance: IPluginInstance;
  limit: string;
  maxDuration: string;
  minDuration: string;
  operation: string;
  service: string;
  showChart: boolean;
  tags: string;
  times: ITimes;
}> = ({ instance, limit, maxDuration, minDuration, operation, service, tags, showChart, times }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<
    { colors: Record<string, string>; traces: ITrace[] },
    APIError
  >(['jaeger/traces', instance, limit, maxDuration, minDuration, operation, service, tags, times], async () => {
    const res = await apiContext.client.get<{ data?: ITrace[] }>(
      `/api/plugins/jaeger/traces?limit=${limit || '20'}&maxDuration=${maxDuration || ''}&minDuration=${
        minDuration || ''
      }&operation=${operation || ''}&service=${service || ''}&tags=${encodeTags(tags || '')}&timeStart=${
        times.timeStart
      }&timeEnd=${times.timeEnd}`,
      {
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      },
    );

    if (!res || !res.data || res.data.length === 0) {
      return { colors: {}, traces: [] };
    }

    const traces: ITrace[] = [];
    const colors = getColors(res.data);

    for (const trace of res.data) {
      const transformedTrace = transformTraceData(trace);
      if (transformedTrace) {
        traces.push(transformedTrace);
      }
    }

    return { colors: colors, traces: traces };
  });

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to get traces"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || !data.traces || data.traces.length === 0}
      noDataTitle="No traces were found"
      noDataMessage="No traces were found for the provided services"
      refetch={refetch}
    >
      {data && data.traces && data.colors ? (
        <>
          {showChart && <TracesChart instance={instance} colors={data?.colors} traces={data?.traces ?? []} />}

          <List sx={{ bgcolor: 'background.paper' }} disablePadding={true}>
            {data?.traces?.map((trace, index) => (
              <Fragment key={trace.traceID}>
                <Trace instance={instance} colors={data.colors} trace={trace} />
                {index + 1 !== data?.traces?.length && <Divider component="li" />}
              </Fragment>
            ))}
          </List>
        </>
      ) : null}
    </UseQueryWrapper>
  );
};
