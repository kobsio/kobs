import {
  APIContext,
  APIError,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DetailsDrawer,
  EmbeddedPanel,
  formatTimeString,
  IAPIContext,
  IPluginInstance,
  ITimes,
  UseQueryWrapper,
} from '@kobsio/core';
import { DoNotDisturb, MoreVert, OpenInNew, RadioButtonChecked, Snooze } from '@mui/icons-material';
import {
  Alert as MUIAlert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Select,
  Snackbar,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Fragment, FunctionComponent, MouseEvent, useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import Status from './Status';

import { priorityColor, queryWithTime } from '../utils/utils';

interface IAlert {
  acknowledged?: boolean;
  alias?: string;
  count?: number;
  createdAt?: string;
  id?: string;
  integration?: IIntegration;
  isSeen?: boolean;
  lastOccuredAt?: string;
  message?: string;
  owner?: string;
  priority?: string;
  report?: IReport;
  responders?: IResponder[];
  seen?: boolean;
  snoozed?: boolean;
  snoozedUntil?: string;
  source?: string;
  status?: string;
  tags?: string[];
  tinyId?: string;
  updatedAt?: string;
}

interface IResponder {
  id?: string;
  name?: string;
  type?: string;
  username?: string;
}

interface IIntegration {
  id?: string;
  name?: string;
  type?: string;
}

interface IReport {
  ackTime?: number;
  acknowledgedBy?: string;
  closeTime?: number;
  closedBy?: string;
}

interface IAlertDetails {
  description?: string;
  details?: Record<string, string>;
}

interface ILog {
  createdAt?: string;
  log?: string;
  offset?: string;
  owner?: string;
  type?: string;
}

interface INote {
  createdAt?: string;
  note?: string;
  offset?: string;
  owner?: string;
}

type TAction = '' | 'acknowledge' | 'snooze' | 'close';

const Actions: FunctionComponent<{
  alert: IAlert;
  anchorEl: null | HTMLElement;
  close: () => void;
  instance: IPluginInstance;
  refetch: () => void;
}> = ({ anchorEl, instance, alert, refetch, close }) => {
  const apiContext = useContext<IAPIContext>(APIContext);
  const [message, setMessage] = useState<{ message: string; severity: 'success' | 'error' }>();
  const [action, setAction] = useState<TAction>('');
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const [snoozeDuration, setSnoozeDuration] = useState<string>('1h');

  const handleShowAction = (a: TAction) => {
    close();
    setAction(a);
  };

  const handleCloseAction = (message: string, severity: 'success' | 'error') => {
    setAction('');

    if (message !== '') {
      if (severity === 'success') {
        refetch();
      }

      setMessage({ message: message, severity: severity });
    }
  };

  const handleAcknowledge = async () => {
    close();

    try {
      await apiContext.client.get(`/api/plugins/opsgenie/alert/acknowledge?id=${alert.id}`, {
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
      handleCloseAction('Alert acknowledged', 'success');
    } catch (err) {
      if (err instanceof APIError) {
        handleCloseAction(err.message, 'error');
      } else {
        handleCloseAction('', 'error');
      }
    }
  };

  const handleSnooze = async () => {
    close();

    try {
      await apiContext.client.get(`/api/plugins/opsgenie/alert/snooze?id=${alert.id}&snooze=${snoozeDuration}`, {
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
      handleCloseAction('Alert snoozed', 'success');
    } catch (err) {
      if (err instanceof APIError) {
        handleCloseAction(err.message, 'error');
      } else {
        handleCloseAction('', 'error');
      }
    }
  };

  const handleClose = async () => {
    close();

    try {
      await apiContext.client.get(`/api/plugins/opsgenie/alert/close?id=${alert.id}`, {
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
      handleCloseAction('Alert closed', 'success');
    } catch (err) {
      if (err instanceof APIError) {
        handleCloseAction(err.message, 'error');
      } else {
        handleCloseAction('', 'error');
      }
    }
  };

  return (
    <>
      <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={close}>
        <MenuItem onClick={handleAcknowledge}>
          <ListItemIcon>
            <RadioButtonChecked fontSize="small" />
          </ListItemIcon>
          <ListItemText>Acknowledge</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => handleShowAction('snooze')}>
          <ListItemIcon>
            <Snooze fontSize="small" />
          </ListItemIcon>
          <ListItemText>Snooze</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <DoNotDisturb fontSize="small" />
          </ListItemIcon>
          <ListItemText>Close</ListItemText>
        </MenuItem>
        {instance?.options?.url && (
          <MenuItem component={Link} to={`${instance?.options?.url}/alert/detail/${alert.id}/details`} target="_blank">
            <ListItemIcon>
              <OpenInNew fontSize="small" />
            </ListItemIcon>
            <ListItemText>Open in Opsgenie</ListItemText>
          </MenuItem>
        )}
      </Menu>

      <Snackbar open={message !== undefined} autoHideDuration={5000} onClose={() => setMessage(undefined)}>
        <MUIAlert onClose={() => setMessage(undefined)} severity={message?.severity} sx={{ width: '100%' }}>
          {message?.message}
        </MUIAlert>
      </Snackbar>

      {action === 'snooze' && (
        <Dialog
          open={action === 'snooze'}
          onClose={() => handleCloseAction('', 'success')}
          fullScreen={fullScreen}
          maxWidth="md"
        >
          <DialogTitle>Snooze</DialogTitle>
          <DialogContent sx={{ minWidth: '50vw' }}>
            <FormControl size="small" fullWidth={true} sx={{ my: 2 }}>
              <InputLabel id="snooze-duration">Duration</InputLabel>
              <Select
                labelId="snooze-duration"
                label="Container"
                value={snoozeDuration}
                onChange={(e): void => setSnoozeDuration(e.target.value)}
              >
                <MenuItem value="15m">15m</MenuItem>
                <MenuItem value="30m">30m</MenuItem>
                <MenuItem value="1h">1h</MenuItem>
                <MenuItem value="3h">3h</MenuItem>
                <MenuItem value="6h">6h</MenuItem>
                <MenuItem value="12h">12h</MenuItem>
                <MenuItem value="24h">24h</MenuItem>
                <MenuItem value="48h">48h</MenuItem>
                <MenuItem value="72h">72h</MenuItem>
                <MenuItem value="168h">168h</MenuItem>
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button
              variant="contained"
              color="primary"
              size="small"
              startIcon={<DoNotDisturb />}
              onClick={handleSnooze}
            >
              Snooze
            </Button>
            <Button variant="outlined" size="small" onClick={() => handleCloseAction('', 'success')}>
              Cancel
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

const Infos: FunctionComponent<{ alert: IAlert }> = ({ alert }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 4, pt: 2 }}>
      <Box component="span">
        <Typography component="span">Priority:</Typography>
        <Chip sx={{ ml: 2 }} size="small" color={priorityColor(alert.priority)} label={alert.priority} />
      </Box>

      <Box component="span">
        <Typography component="span">Status:</Typography>
        <Status
          status={alert.status || ''}
          snoozed={alert.snoozed || false}
          acknowledged={alert.acknowledged || false}
        />
      </Box>

      {alert.owner && (
        <Box component="span">
          <Typography component="span">Owner:</Typography>
          <Chip sx={{ ml: 2 }} size="small" label={alert.owner} />
        </Box>
      )}

      {alert.tags && alert.tags.length > 0 && (
        <Box component="span">
          <Typography component="span">Tags:</Typography>
          {alert.tags.map((tag) => (
            <Chip key={tag} sx={{ ml: 2 }} size="small" label={tag} />
          ))}
        </Box>
      )}
    </Box>
  );
};

const DetailsNotes: FunctionComponent<{ alert: IAlert; instance: IPluginInstance }> = ({ instance, alert }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<INote[], APIError>(
    ['opsgenie/alerts/notes', instance, alert],
    async () => {
      return apiContext.client.get<INote[]>(`/api/plugins/opsgenie/alert/notes?id=${alert.id}`, {
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
      errorTitle="Failed to load notes"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || data.length === 0}
      noDataTitle="No notes were found"
      refetch={refetch}
    >
      {data && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" pb={2}>
              Notes
            </Typography>
            <DescriptionList>
              {data.map((note, index) => (
                <DescriptionListGroup key={index}>
                  <DescriptionListTerm>{note.createdAt ? formatTimeString(note.createdAt) : ''}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {note.owner ? `${note.owner}: ` : ''}
                    {note.note || ''}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              ))}
            </DescriptionList>
          </CardContent>
        </Card>
      )}
    </UseQueryWrapper>
  );
};

const DetailsLogs: FunctionComponent<{ alert: IAlert; instance: IPluginInstance }> = ({ instance, alert }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<ILog[], APIError>(
    ['opsgenie/alerts/logs', instance, alert],
    async () => {
      return apiContext.client.get<ILog[]>(`/api/plugins/opsgenie/alert/logs?id=${alert.id}`, {
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
      errorTitle="Failed to load logs"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || data.length === 0}
      noDataTitle="No logs were found"
      refetch={refetch}
    >
      {data && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" pb={2}>
              Logs
            </Typography>
            <DescriptionList>
              {data.map((log, index) => (
                <DescriptionListGroup key={index}>
                  <DescriptionListTerm>{log.createdAt ? formatTimeString(log.createdAt) : ''}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {log.owner ? `${log.owner}: ` : ''}
                    {log.log || ''}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              ))}
            </DescriptionList>
          </CardContent>
        </Card>
      )}
    </UseQueryWrapper>
  );
};

const DetailsDetails: FunctionComponent<{ alert: IAlert; instance: IPluginInstance }> = ({ instance, alert }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IAlertDetails, APIError>(
    ['opsgenie/alerts/details', instance, alert],
    async () => {
      return apiContext.client.get<IAlertDetails>(`/api/plugins/opsgenie/alert/details?id=${alert.id}`, {
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
      errorTitle="Failed to load alert details"
      isError={isError}
      isLoading={isLoading}
      isNoData={false}
      refetch={refetch}
    >
      {data && data.description ? (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" pb={2}>
              Description
            </Typography>
            <Typography whiteSpace="pre-wrap">{data.description}</Typography>
          </CardContent>
        </Card>
      ) : null}

      {data && data.details && Object.keys(data.details).length > 0 ? (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" pb={2}>
              Details
            </Typography>
            <DescriptionList>
              {Object.keys(data.details).map((key) => (
                <DescriptionListGroup key={key}>
                  <DescriptionListTerm>{key}</DescriptionListTerm>
                  <DescriptionListDescription>{data.details?.[key]}</DescriptionListDescription>
                </DescriptionListGroup>
              ))}
            </DescriptionList>
          </CardContent>
        </Card>
      ) : null}
    </UseQueryWrapper>
  );
};

const DetailsRunbook: FunctionComponent<{ alert: IAlert; instance: IPluginInstance }> = ({ instance, alert }) => {
  const apiContext = useContext<IAPIContext>(APIContext);
  const [times, setTimes] = useState<ITimes>({
    time: 'last15Minutes',
    timeEnd: Math.floor(Date.now() / 1000),
    timeStart: Math.floor(Date.now() / 1000) - 900,
  });

  const { isError, isLoading, error, data, refetch } = useQuery<IAlertDetails, APIError>(
    ['opsgenie/alerts/details', instance, alert],
    async () => {
      return apiContext.client.get<IAlertDetails>(`/api/plugins/opsgenie/alert/details?id=${alert.id}`, {
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
      errorTitle="Failed to load alert details"
      isError={isError}
      isLoading={isLoading}
      isNoData={false}
      refetch={refetch}
    >
      {data && data.details ? (
        <EmbeddedPanel
          cluster={instance.options?.integrations?.runbook?.plugin?.cluster ?? ''}
          name={instance.options?.integrations?.runbook?.plugin?.name ?? ''}
          options={{
            alert: data.details[instance.options?.integrations?.runbook?.options?.alertname] ?? '',
            group: data.details[instance.options?.integrations?.runbook?.options?.alertgroup] ?? '',
            type: 'details',
          }}
          title=""
          type={instance.options?.integrations?.runbook?.plugin?.type ?? ''}
          times={times}
          setTimes={setTimes}
        />
      ) : null}
    </UseQueryWrapper>
  );
};

const Details: FunctionComponent<{
  alert: IAlert;
  instance: IPluginInstance;
  onClose: () => void;
  open: boolean;
  refetch: () => void;
}> = ({ instance, alert, onClose, open, refetch }) => {
  const [activeTab, setActiveTab] = useState('details');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenActions = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleCloseActions = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <DetailsDrawer
        size="large"
        open={open}
        onClose={onClose}
        title={alert.message ?? ''}
        subtitle={`(${formatTimeString(alert.createdAt ?? '')})`}
        actions={
          <IconButton edge="end" color="inherit" sx={{ mr: 1 }} onClick={handleOpenActions}>
            <MoreVert />
          </IconButton>
        }
      >
        <Infos alert={alert} />

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 6 }}>
          <Tabs
            variant="scrollable"
            scrollButtons={false}
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
          >
            <Tab label="Details" value="details" />
            <Tab label="Logs" value="logs" />
            <Tab label="Notes" value="notes" />
            {instance.options &&
              instance.options.integrations &&
              instance.options.integrations.runbook &&
              instance.options.integrations.runbook.plugin &&
              instance.options.integrations.runbook.plugin.cluster &&
              instance.options.integrations.runbook.plugin.name &&
              instance.options.integrations.runbook.plugin.type &&
              instance.options.integrations.runbook.options &&
              instance.options.integrations.runbook.options.alertname &&
              instance.options.integrations.runbook.options.alertgroup && <Tab label="Runbook" value="runbook" />}
          </Tabs>
        </Box>

        <Box hidden={activeTab !== 'details'} sx={{ pt: 6 }}>
          {activeTab === 'details' && <DetailsDetails instance={instance} alert={alert} />}
        </Box>
        <Box hidden={activeTab !== 'logs'} sx={{ pt: 6 }}>
          {activeTab === 'logs' && <DetailsLogs instance={instance} alert={alert} />}
        </Box>
        <Box hidden={activeTab !== 'notes'} sx={{ pt: 6 }}>
          {activeTab === 'notes' && <DetailsNotes instance={instance} alert={alert} />}
        </Box>
        <Box hidden={activeTab !== 'runbook'} sx={{ pt: 6 }}>
          {activeTab === 'runbook' && <DetailsRunbook instance={instance} alert={alert} />}
        </Box>
      </DetailsDrawer>

      <Actions anchorEl={anchorEl} instance={instance} alert={alert} refetch={refetch} close={handleCloseActions} />
    </>
  );
};

const Alert: FunctionComponent<{ alert: IAlert; instance: IPluginInstance; refetch: () => void }> = ({
  instance,
  alert,
  refetch,
}) => {
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenActions = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setAnchorEl(e.currentTarget);
  };

  const handleCloseActions = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <ListItem
        sx={{ cursor: 'pointer' }}
        onClick={() => setOpen(true)}
        secondaryAction={
          <IconButton size="small" onClick={handleOpenActions}>
            <MoreVert />
          </IconButton>
        }
      >
        <ListItemText
          primary={
            <Typography variant="h6">
              {alert.message}
              <Typography pl={2} color="text.secondary" variant="caption">
                ({formatTimeString(alert.createdAt ?? '')})
              </Typography>
            </Typography>
          }
          secondaryTypographyProps={{ component: 'div' }}
          secondary={<Infos alert={alert} />}
        />
      </ListItem>

      <Details alert={alert} instance={instance} onClose={() => setOpen(false)} open={open} refetch={refetch} />
      <Actions anchorEl={anchorEl} instance={instance} alert={alert} close={handleCloseActions} refetch={refetch} />
    </>
  );
};

const Alerts: FunctionComponent<{ instance: IPluginInstance; interval?: number; query: string; times: ITimes }> = ({
  instance,
  interval,
  query,
  times,
}) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IAlert[], APIError>(
    ['opsgenie/alerts', instance, interval, query, times],
    async () => {
      return apiContext.client.get<IAlert[]>(
        `/api/plugins/opsgenie/alerts?query=${queryWithTime(query, times, interval)}`,
        {
          headers: {
            'x-kobs-cluster': instance.cluster,
            'x-kobs-plugin': instance.name,
          },
        },
      );
    },
  );

  const refetchWithTimout = () => {
    setTimeout(() => {
      refetch();
    }, 3000);
  };

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Failed to load alerts"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || data.length === 0}
      noDataTitle="No alerts were found"
      refetch={refetch}
    >
      <Card>
        <List disablePadding={true}>
          {data?.map((alert, index) => (
            <Fragment key={alert.id}>
              <Alert instance={instance} alert={alert} refetch={refetchWithTimout} />
              {index + 1 !== data?.length && <Divider component="li" />}
            </Fragment>
          ))}
        </List>
      </Card>
    </UseQueryWrapper>
  );
};

export default Alerts;
