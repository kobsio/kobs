import { APIContext, APIError, IAPIContext, IPluginInstance, pluginBasePath, UseQueryWrapper } from '@kobsio/core';
import { CompareArrows, ContentCopy, MoreVert, OpenInNew, ViewTimeline } from '@mui/icons-material';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

import { Flamegraph } from './Flamegraph';
import { Spans } from './Spans';

import { formatTraceTime, getColors, ITrace, transformTraceData } from '../utils/utils';

export const TraceActions: FunctionComponent<{
  instance: IPluginInstance;
  isDrawerAction?: boolean;
  setView: (view: 'timeline' | 'flamegraph') => void;
  trace: ITrace;
  view: 'timeline' | 'flamegraph';
}> = ({ instance, trace, view, setView, isDrawerAction = false }) => {
  const navigate = useNavigate();
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [showCompare, setShowCompare] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [compareTraceID, setCompareTraceID] = useState<string>('');
  const open = Boolean(anchorEl);

  const copy = (): void => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(`${window.location.host}${pluginBasePath(instance)}/trace/${trace.traceID}`);
    }
    setAnchorEl(null);
  };

  const handleShowCompare = () => {
    setShowCompare(true);
    setAnchorEl(null);
  };

  const handleCompare = () => {
    setShowCompare(false);
    navigate(`${pluginBasePath(instance)}/trace/${trace.traceID}?compareTraceID=${compareTraceID}`);
  };

  return (
    <>
      {isDrawerAction ? (
        <IconButton edge="end" color="inherit" sx={{ mr: 1 }} onClick={(e) => setAnchorEl(e.currentTarget)}>
          <MoreVert />
        </IconButton>
      ) : (
        <IconButton onClick={(e) => setAnchorEl(e.currentTarget)}>
          <MoreVert />
        </IconButton>
      )}

      <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
        <MenuItem onClick={() => (view === 'timeline' ? setView('flamegraph') : setView('timeline'))}>
          <ListItemIcon>
            <ViewTimeline fontSize="small" />
          </ListItemIcon>
          <ListItemText>{view === 'timeline' ? 'Trace Flamegraph' : 'Trace Timeline'}</ListItemText>
        </MenuItem>
        <MenuItem component={Link} to={`${pluginBasePath(instance)}/trace/${trace.traceID}`}>
          <ListItemIcon>
            <OpenInNew fontSize="small" />
          </ListItemIcon>
          <ListItemText>Details</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleShowCompare}>
          <ListItemIcon>
            <CompareArrows fontSize="small" />
          </ListItemIcon>
          <ListItemText>Compare</ListItemText>
        </MenuItem>
        <MenuItem onClick={copy}>
          <ListItemIcon>
            <ContentCopy fontSize="small" />
          </ListItemIcon>
          <ListItemText>Copy</ListItemText>
        </MenuItem>
        {instance.options?.address && (
          <MenuItem component={Link} to={`${instance.options.address}/trace/${trace.traceID}`} target="_blank">
            <ListItemIcon>
              <OpenInNew fontSize="small" />
            </ListItemIcon>
            <ListItemText>Open in Jaeger</ListItemText>
          </MenuItem>
        )}
      </Menu>

      <Dialog open={showCompare} onClose={() => setShowCompare(false)} fullScreen={fullScreen} maxWidth="md">
        <DialogTitle>Compare</DialogTitle>
        <DialogContent sx={{ minWidth: '50vw' }}>
          <Stack spacing={2} direction="column">
            <p>Provide the Trace ID of the trace you want to compare with the current trace.</p>
            <TextField
              size="small"
              label="Trace ID"
              value={compareTraceID}
              onChange={(e) => setCompareTraceID(e.target.value)}
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            color="primary"
            size="small"
            startIcon={<CompareArrows />}
            onClick={handleCompare}
          >
            Compare
          </Button>
          <Button variant="outlined" size="small" onClick={() => setShowCompare(false)}>
            Cancel
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export const TraceID: FunctionComponent<{ instance: IPluginInstance; traceID: string }> = ({ instance, traceID }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<
    { colors: Record<string, string>; trace: ITrace | null } | null,
    APIError
  >(['jaeger/trace', instance, traceID], async () => {
    const res = await apiContext.client.get<{ data?: ITrace[] }>(`/api/plugins/jaeger/trace?traceID=${traceID}`, {
      headers: {
        'x-kobs-cluster': instance.cluster,
        'x-kobs-plugin': instance.name,
      },
    });

    if (res.data && res.data.length === 1) {
      return {
        colors: getColors(res.data),
        trace: transformTraceData(res.data[0]),
      };
    }

    return null;
  });

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to get trace"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || !data.trace}
      noDataTitle="No trace was found"
      refetch={refetch}
    >
      {data && data.trace ? <Trace instance={instance} colors={data.colors} trace={data.trace} /> : null}
    </UseQueryWrapper>
  );
};

export const TraceData: FunctionComponent<{ instance: IPluginInstance; traceData: ITrace }> = ({
  instance,
  traceData,
}) => {
  const colors = getColors([traceData]);
  const trace = transformTraceData(traceData);

  if (!trace) {
    return null;
  }

  return <Trace instance={instance} colors={colors} trace={trace} />;
};

const Trace: FunctionComponent<{ colors: Record<string, string>; instance: IPluginInstance; trace: ITrace }> = ({
  instance,
  colors,
  trace,
}) => {
  const [view, setView] = useState<'timeline' | 'flamegraph'>('timeline');

  return (
    <Stack>
      <Grid justifyContent="space-between" container={true} spacing={2}>
        <Grid item={true} xs={10} overflow="hidden" textOverflow="ellipsis">
          <Typography variant="h3" gutterBottom={true} noWrap={true}>
            {trace.traceName}
            <Typography pl={2} color="text.secondary" variant="caption">
              {trace.traceID}
            </Typography>
          </Typography>
        </Grid>

        <Grid item={true} xs={2} sx={{ textAlign: 'right' }}>
          <TraceActions instance={instance} trace={trace} view={view} setView={setView} />
        </Grid>

        <Grid item={true} xs={12}>
          <Typography component="div" noWrap={true}>
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
          </Typography>
        </Grid>
      </Grid>

      <Box minWidth="100%" py={6}>
        <Divider role="divider" />
      </Box>

      <Box sx={{ bgcolor: 'background.paper', height: 'calc(100vh - 96px - 74px - 50px)', p: 4 }}>
        {view === 'timeline' ? (
          <Spans instance={instance} colors={colors} trace={trace} />
        ) : (
          <Flamegraph instance={instance} colors={colors} trace={trace} />
        )}
      </Box>
    </Stack>
  );
};
