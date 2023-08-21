import {
  APIContext,
  APIError,
  Editor,
  IAPIContext,
  IPluginInstance,
  IPluginPageProps,
  Page,
  ResourcesSelectClusters,
  ResourcesSelectNamespaces,
  Toolbar,
  ToolbarItem,
  useLocalStorageState,
  useQueryState,
  useUpdate,
} from '@kobsio/core';
import { MoreVert, PlayArrow, Refresh } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  AlertTitle,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import yaml from 'js-yaml';
import { FunctionComponent, MouseEvent, useContext, useEffect, useState } from 'react';

import Resources from './Resources';

import { description, TVeleroType } from '../utils/utils';

const VeleroActionsCreateBackup: FunctionComponent<{
  instance: IPluginInstance;
  onClose: (message: string, severity: 'success' | 'error') => void;
  open: boolean;
}> = ({ instance, open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const apiContext = useContext<IAPIContext>(APIContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [cluster, setCluster] = useState<string>('');
  const [backup, setBackup] = useState<string>(instance.options?.backupTemplate ?? '');

  const handleCreateBackup = async (): Promise<void> => {
    setIsLoading(true);

    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const parsedBackup = yaml.load(backup) as any;
      await apiContext.client.post(
        `/api/resources?namespace=${
          parsedBackup?.metadata?.namespace ?? 'velero'
        }&resource=backups&path=/apis/velero.io/v1`,
        {
          body: parsedBackup,
          headers: {
            'x-kobs-cluster': cluster,
          },
        },
      );

      setIsLoading(false);
      onClose(`Backup was created`, 'success');
    } catch (err) {
      setIsLoading(false);

      if (err instanceof APIError) {
        onClose(err.message, 'error');
      } else {
        onClose('', 'error');
      }
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose('', 'success')} fullScreen={fullScreen} maxWidth="md">
      <DialogTitle>Create Backup</DialogTitle>
      <DialogContent sx={{ minWidth: '50vw' }}>
        <Stack spacing={2} pt={2} direction="column">
          <TextField size="small" label="Cluster" value={cluster} onChange={(e) => setCluster(e.target.value)} />
          <Editor language="yaml" value={backup} onChange={(value) => setBackup(value ?? '')} />
        </Stack>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          variant="contained"
          color="primary"
          size="small"
          startIcon={<PlayArrow />}
          loading={isLoading}
          loadingPosition="start"
          onClick={handleCreateBackup}
        >
          Create Backup
        </LoadingButton>
        <Button variant="outlined" size="small" onClick={() => onClose('', 'success')}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const VeleroActions: FunctionComponent<{ instance: IPluginInstance }> = ({ instance }) => {
  const [message, setMessage] = useState<{ message: string; severity: 'success' | 'error' }>();
  const [showCreateBackup, setShowCreateBackup] = useState<boolean>(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const handleOpen = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleCloseCreateBackup = (message: string, severity: 'success' | 'error') => {
    setShowCreateBackup(false);
    if (message !== '') {
      setMessage({ message: message, severity: severity });
    }
  };

  const handleOpenCreateBackup = () => {
    handleClose();
    setShowCreateBackup(true);
  };

  return (
    <>
      <IconButton size="small" onClick={handleOpen} aria-label="open menu">
        <MoreVert />
      </IconButton>
      <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
        <MenuItem onClick={handleOpenCreateBackup}>
          <ListItemText>Create Backup</ListItemText>
        </MenuItem>
      </Menu>

      <Snackbar open={message !== undefined} autoHideDuration={5000} onClose={() => setMessage(undefined)}>
        <Alert onClose={() => setMessage(undefined)} severity={message?.severity} sx={{ width: '100%' }}>
          {message?.message}
        </Alert>
      </Snackbar>

      {showCreateBackup && (
        <VeleroActionsCreateBackup instance={instance} open={showCreateBackup} onClose={handleCloseCreateBackup} />
      )}
    </>
  );
};

/**
 * `IOptions` are the options which can be set by a user to get a list of FLux resources. The `param` and `paramName`
 * can not be set be a user, but are required to show a specific Flux resource for anotherone (e.g. the Git repository
 * for a Kustomization).
 */
interface IOptions {
  clusters: string[];
  namespaces: string[];
  param: string;
  paramName: string;
  type: TVeleroType;
}

/**
 * The `VeleroPage` component is used as plugin page within the Flux plugin. The user can select a list of clusters,
 * namespaces and the Flux resource type for which he wants to view all CRs.
 */
const VeleroPage: FunctionComponent<IPluginPageProps> = ({ instance }) => {
  const update = useUpdate();
  const [persistedOptions, setPersistedOptions] = useLocalStorageState<IOptions>('kobs-velero-velero-options', {
    clusters: [],
    namespaces: [],
    param: '',
    paramName: '',
    type: 'backups',
  });
  const [options, setOptions] = useQueryState<IOptions>(persistedOptions);

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
          <ToolbarItem grow={true} width="250px">
            <ResourcesSelectClusters
              selectedClusters={options.clusters ?? []}
              selectClusters={(clusters) => setOptions({ ...options, clusters: clusters, param: '', paramName: '' })}
            />
          </ToolbarItem>
          <ToolbarItem grow={true} width="250px">
            <ResourcesSelectNamespaces
              selectedClusters={options.clusters ?? []}
              selectedNamespaces={options.namespaces ?? []}
              selectNamespaces={(namespaces) =>
                setOptions({ ...options, namespaces: namespaces, param: '', paramName: '' })
              }
            />
          </ToolbarItem>
          <ToolbarItem>
            <ToggleButtonGroup
              size="small"
              value={options.type}
              exclusive={true}
              onChange={(_, value) => setOptions({ ...options, param: '', paramName: '', type: value })}
            >
              <ToggleButton sx={{ px: 4 }} value="backups">
                Backups
              </ToggleButton>
              <ToggleButton sx={{ px: 4 }} value="restores">
                Restores
              </ToggleButton>
              <ToggleButton sx={{ px: 4 }} value="schedules">
                Schedules
              </ToggleButton>
            </ToggleButtonGroup>
          </ToolbarItem>
          <ToolbarItem>
            <Button variant="contained" color="primary" onClick={() => update()}>
              <Refresh />
            </Button>
          </ToolbarItem>
        </Toolbar>
      }
      actions={<VeleroActions instance={instance} />}
    >
      {!options.clusters || options.clusters.length === 0 ? (
        <Alert severity="info">
          <AlertTitle>Select a cluster</AlertTitle>
          You have to select at least one cluster in the toolbar.
        </Alert>
      ) : (
        <Resources
          instance={instance}
          clusters={options.clusters}
          namespaces={options.namespaces}
          resource={options.type}
          paramName={options.paramName}
          param={options.param}
          times={{
            time: 'last15Minutes',
            timeEnd: Math.floor(Date.now() / 1000),
            timeStart: Math.floor(Date.now() / 1000) - 900,
          }}
        />
      )}
    </Page>
  );
};

export default VeleroPage;
