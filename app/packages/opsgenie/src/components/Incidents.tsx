import {
  APIContext,
  APIError,
  DescriptionList,
  DescriptionListDescription,
  DescriptionListGroup,
  DescriptionListTerm,
  DetailsDrawer,
  formatTimeString,
  IAPIContext,
  IPluginInstance,
  ITimes,
  UseQueryWrapper,
} from '@kobsio/core';
import { CheckCircle, DoNotDisturb, MoreVert, OpenInNew } from '@mui/icons-material';
import {
  Alert as MUIAlert,
  Box,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  Tab,
  Tabs,
  Typography,
} from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { Fragment, FunctionComponent, MouseEvent, useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import Status from './Status';

import { priorityColor, queryWithTime } from '../utils/utils';

interface IIncident {
  createdAt?: string;
  extraProperties?: Record<string, string>;
  id?: string;
  message?: string;
  ownerTeam?: string;
  priority?: string;
  responders?: IResponder[];
  serviceId?: string;
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

interface ITimelineEntry {
  actor?: IActor;
  description?: IDescription;
  eventTime?: string;
  group?: string;
  hidden?: boolean;
  id?: string;
  lastEdit?: ILastEdit;
  type?: string;
}

interface IActor {
  name?: string;
  type?: string;
}

interface IDescription {
  name?: string;
  type?: string;
}

interface ILastEdit {
  actor?: IActor;
  editTime?: string;
}

const Actions: FunctionComponent<{
  anchorEl: null | HTMLElement;
  close: () => void;
  incident: IIncident;
  instance: IPluginInstance;
  refetch: () => void;
}> = ({ anchorEl, instance, incident, refetch, close }) => {
  const apiContext = useContext<IAPIContext>(APIContext);
  const [message, setMessage] = useState<{ message: string; severity: 'success' | 'error' }>();

  const handleCloseAction = (message: string, severity: 'success' | 'error') => {
    if (message !== '') {
      if (severity === 'success') {
        refetch();
      }

      setMessage({ message: message, severity: severity });
    }
  };

  const handleResolve = async () => {
    close();

    try {
      await apiContext.client.get(`/api/plugins/opsgenie/incident/resolve?id=${incident.id}`, {
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
      handleCloseAction('Incident resolved', 'success');
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
      await apiContext.client.get(`/api/plugins/opsgenie/incident/close?id=${incident.id}`, {
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
      handleCloseAction('Incident closed', 'success');
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
        <MenuItem onClick={handleResolve}>
          <ListItemIcon>
            <CheckCircle fontSize="small" />
          </ListItemIcon>
          <ListItemText>Resolve</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleClose}>
          <ListItemIcon>
            <DoNotDisturb fontSize="small" />
          </ListItemIcon>
          <ListItemText>Close</ListItemText>
        </MenuItem>
        {instance?.options?.url && (
          <MenuItem component={Link} to={`${instance?.options?.url}/incident/detail/${incident.id}`} target="_blank">
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
    </>
  );
};

const Infos: FunctionComponent<{ incident: IIncident }> = ({ incident }) => {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'row', flexWrap: 'wrap', gap: 4, pt: 2 }}>
      <Box component="span">
        <Typography component="span">Priority:</Typography>
        <Chip sx={{ ml: 2 }} size="small" color={priorityColor(incident.priority)} label={incident.priority} />
      </Box>

      <Box component="span">
        <Typography component="span">Status:</Typography>
        <Status status={incident.status || ''} snoozed={false} acknowledged={false} />
      </Box>

      {incident.ownerTeam && (
        <Box component="span">
          <Typography component="span">Owner:</Typography>
          <Chip sx={{ ml: 2 }} size="small" label={incident.ownerTeam} />
        </Box>
      )}

      {incident.tags && incident.tags.length > 0 && (
        <Box component="span">
          <Typography component="span">Tags:</Typography>
          {incident.tags.map((tag) => (
            <Chip key={tag} sx={{ ml: 2 }} size="small" label={tag} />
          ))}
        </Box>
      )}

      {incident.extraProperties && Object.keys(incident.extraProperties).length > 0 && (
        <Box component="span">
          <Typography component="span">Extra Properties:</Typography>
          {Object.keys(incident.extraProperties).map((key) => (
            <Chip key={key} sx={{ ml: 2 }} size="small" label={incident.extraProperties?.[key]} />
          ))}
        </Box>
      )}
    </Box>
  );
};

const DetailsNotes: FunctionComponent<{ incident: IIncident; instance: IPluginInstance }> = ({
  instance,
  incident,
}) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<INote[], APIError>(
    ['opsgenie/incidents/notes', instance, incident],
    async () => {
      return apiContext.client.get<INote[]>(`/api/plugins/opsgenie/incident/notes?id=${incident.id}`, {
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

const DetailsLogs: FunctionComponent<{ incident: IIncident; instance: IPluginInstance }> = ({ instance, incident }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<ILog[], APIError>(
    ['opsgenie/incidents/logs', instance, incident],
    async () => {
      return apiContext.client.get<ILog[]>(`/api/plugins/opsgenie/incident/logs?id=${incident.id}`, {
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

const DetailsTimeline: FunctionComponent<{ incident: IIncident; instance: IPluginInstance }> = ({
  instance,
  incident,
}) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<ITimelineEntry[], APIError>(
    ['opsgenie/incident/details', instance, incident],
    async () => {
      return apiContext.client.get<ITimelineEntry[]>(`/api/plugins/opsgenie/incident/timeline?id=${incident.id}`, {
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
      errorTitle="Failed to load incident timeline"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || data.length === 0}
      noDataTitle="No timeline were found"
      refetch={refetch}
    >
      {data && data.length > 0 ? (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" pb={2}>
              Timeline
            </Typography>
            <DescriptionList>
              {data.map((entry, index) => (
                <DescriptionListGroup key={index}>
                  <DescriptionListTerm>{entry.eventTime ? formatTimeString(entry.eventTime) : ''}</DescriptionListTerm>
                  <DescriptionListDescription>
                    {entry.type || ''} by {entry.actor?.name || ''}
                  </DescriptionListDescription>
                </DescriptionListGroup>
              ))}
            </DescriptionList>
          </CardContent>
        </Card>
      ) : null}
    </UseQueryWrapper>
  );
};

const Details: FunctionComponent<{
  incident: IIncident;
  instance: IPluginInstance;
  onClose: () => void;
  open: boolean;
  refetch: () => void;
}> = ({ instance, incident, onClose, open, refetch }) => {
  const [activeTab, setActiveTab] = useState('timeline');
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
        title={incident.message ?? ''}
        subtitle={`(${formatTimeString(incident.createdAt ?? '')})`}
        actions={
          <IconButton edge="end" color="inherit" sx={{ mr: 1 }} onClick={handleOpenActions}>
            <MoreVert />
          </IconButton>
        }
      >
        <Infos incident={incident} />

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 6 }}>
          <Tabs
            variant="scrollable"
            scrollButtons={false}
            value={activeTab}
            onChange={(_, value) => setActiveTab(value)}
          >
            <Tab label="Timeline" value="timeline" />
            <Tab label="Logs" value="logs" />
            <Tab label="Notes" value="notes" />
          </Tabs>
        </Box>

        <Box hidden={activeTab !== 'timeline'} sx={{ pt: 6 }}>
          {activeTab === 'timeline' && <DetailsTimeline instance={instance} incident={incident} />}
        </Box>
        <Box hidden={activeTab !== 'logs'} sx={{ pt: 6 }}>
          {activeTab === 'logs' && <DetailsLogs instance={instance} incident={incident} />}
        </Box>
        <Box hidden={activeTab !== 'notes'} sx={{ pt: 6 }}>
          {activeTab === 'notes' && <DetailsNotes instance={instance} incident={incident} />}
        </Box>
      </DetailsDrawer>

      <Actions
        anchorEl={anchorEl}
        instance={instance}
        incident={incident}
        refetch={refetch}
        close={handleCloseActions}
      />
    </>
  );
};

const Incident: FunctionComponent<{ incident: IIncident; instance: IPluginInstance; refetch: () => void }> = ({
  instance,
  incident,
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
              {incident.message}
              <Typography pl={2} color="text.secondary" variant="caption">
                ({formatTimeString(incident.createdAt ?? '')})
              </Typography>
            </Typography>
          }
          secondaryTypographyProps={{ component: 'div' }}
          secondary={<Infos incident={incident} />}
        />
      </ListItem>

      <Details incident={incident} instance={instance} onClose={() => setOpen(false)} open={open} refetch={refetch} />
      <Actions
        anchorEl={anchorEl}
        instance={instance}
        incident={incident}
        close={handleCloseActions}
        refetch={refetch}
      />
    </>
  );
};

const Incidents: FunctionComponent<{ instance: IPluginInstance; interval?: number; query: string; times: ITimes }> = ({
  instance,
  interval,
  query,
  times,
}) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<IIncident[], APIError>(
    ['opsgenie/incidents', instance, interval, query, times],
    async () => {
      return apiContext.client.get<IIncident[]>(
        `/api/plugins/opsgenie/incidents?query=${queryWithTime(query, times, interval)}`,
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
      errorTitle="Failed to load incidents"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data || data.length === 0}
      noDataTitle="No incidents were found"
      refetch={refetch}
    >
      <Card>
        <List disablePadding={true}>
          {data?.map((incident, index) => (
            <Fragment key={incident.id}>
              <Incident instance={instance} incident={incident} refetch={refetchWithTimout} />
              {index + 1 !== data?.length && <Divider component="li" />}
            </Fragment>
          ))}
        </List>
      </Card>
    </UseQueryWrapper>
  );
};

export default Incidents;
