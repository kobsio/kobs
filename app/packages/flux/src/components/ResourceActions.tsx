import { APIContext, APIError, IAPIContext, IPluginInstance } from '@kobsio/core';
import { Refresh as SyncIcon, Pause as SuspendIcon, PlayArrow as ResumeIcon, MoreVert } from '@mui/icons-material';
import { LoadingButton } from '@mui/lab';
import {
  Alert,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Snackbar,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import { FunctionComponent, MouseEvent, useContext, useState } from 'react';

import { IFluxResource } from '../utils/utils';

/**
 * `TAction` is a list of all actions we are supporting within the Flux plugin.
 */
type TAction = '' | 'sync' | 'suspend' | 'resume';

/**
 * `getJSONPatch` is used to create the JSON patch we can use to `suspend` or to `resume` a resource. For this we are
 * looking at the provided `manifest` and creating a JSON patch for the `suspend` field in the manifest to suspend or
 * resume the resource.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const getJSONPatch = (manifest: any, action: TAction): any => {
  if (action === 'suspend') {
    if (manifest?.suspend) {
      return [{ op: 'replace', path: '/spec/suspend', value: true }];
    }

    return [{ op: 'add', path: '/spec/suspend', value: true }];
  } else {
    if (manifest?.suspend) {
      return [{ op: 'replace', path: '/spec/suspend', value: false }];
    }

    return [{ op: 'add', path: '/spec/suspend', value: false }];
  }
};

/**
 * The `Sync` component is used to sync a Kustomization or Helm Release. The component will render a `Dialog`, where a
 * user must confirm the sync. If the user presses the `Sync` button we call the corresponding API endpoint of the Flux
 * plugin to sync the resource.
 */
const Sync: FunctionComponent<{
  cluster: string;
  fluxResource: IFluxResource;
  instance: IPluginInstance;
  name: string;
  namespace: string;
  onClose: (message: string, severity: 'success' | 'error') => void;
  open: boolean;
}> = ({ instance, fluxResource, cluster, namespace, name, open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const apiContext = useContext<IAPIContext>(APIContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * `handleSync` handles the API call to sync a resource. During the sync we set the `isLoading` state to `true`. If
   * the sync was successfull we close the dialog with a success message. In case of an error the error message will be
   * shown.
   */
  const handleSync = async (): Promise<void> => {
    setIsLoading(true);

    try {
      await apiContext.client.get(
        `/api/plugins/flux/sync?namespace=${namespace}&name=${name}&resource=${fluxResource.type}`,
        {
          headers: {
            'x-kobs-cluster': cluster,
            'x-kobs-plugin': instance.name,
          },
        },
      );

      setIsLoading(false);
      onClose(`Resource was synced`, 'success');
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
      <DialogTitle>Sync</DialogTitle>
      <DialogContent sx={{ minWidth: '50vw' }}>
        <p>
          Do you really want to sync the resource{' '}
          <b>
            {name} ({cluster} / {namespace})
          </b>
          ?
        </p>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          variant="contained"
          color="primary"
          size="small"
          startIcon={<SyncIcon />}
          loading={isLoading}
          loadingPosition="start"
          onClick={handleSync}
        >
          Sync
        </LoadingButton>
        <Button variant="outlined" size="small" onClick={() => onClose('', 'success')}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * The `SuspendResume` component will render a `Dialog` to suspend or resume a resource. After a user confirms the
 * action we make the corresponding API call to patch the Flux resource.
 */
const SuspendResume: FunctionComponent<{
  action: TAction;
  cluster: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  manifest: any;
  name: string;
  namespace: string;
  onClose: (message: string, severity: 'success' | 'error') => void;
  open: boolean;
  path: string;
  resource: string;
}> = ({ cluster, namespace, name, action, manifest, resource, path, open, onClose }) => {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const apiContext = useContext<IAPIContext>(APIContext);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * `handleSuspendResume` handles the API call to suspend / resume a resource. For this we are using the `getJSONPatch`
   * function to create the JSON patch. During the API call the `isLoading` state is set to `true`. When the API call is
   * finished we show a success or error message, depending on the result of the call.
   */
  const handleSuspendResume = async (): Promise<void> => {
    setIsLoading(true);

    try {
      await apiContext.client.put(
        `/api/resources?namespace=${namespace}&name=${name}&resource=${resource}&path=${path}`,
        {
          body: getJSONPatch(manifest, action),
          headers: {
            'x-kobs-cluster': cluster,
          },
        },
      );

      setIsLoading(false);
      onClose(`Resource was ${action === 'suspend' ? 'suspended' : 'resumed'}`, 'success');
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
      <DialogTitle>{action === 'suspend' ? 'Suspend' : 'Resume'}</DialogTitle>
      <DialogContent sx={{ minWidth: '50vw' }}>
        <p>
          Do you really want to {action} the resource{' '}
          <b>
            {name} ({cluster} / {namespace})
          </b>
          ?
        </p>
      </DialogContent>
      <DialogActions>
        <LoadingButton
          variant="contained"
          color="primary"
          size="small"
          startIcon={action === 'suspend' ? <SuspendIcon /> : <ResumeIcon />}
          loading={isLoading}
          loadingPosition="start"
          onClick={handleSuspendResume}
        >
          {action === 'suspend' ? 'Suspend' : 'Resume'}
        </LoadingButton>
        <Button variant="outlined" size="small" onClick={() => onClose('', 'success')}>
          Cancel
        </Button>
      </DialogActions>
    </Dialog>
  );
};

/**
 * The `ResourceActions` component is used to show an action menu for a resource. The action menu allows a user to
 * suspend or resume a resource. For Kustomizations and HelmReleases it is also possible to trigger a sync.
 *
 * The action can be used within a row of a resource or in the details drawer of a resource. When used in a drawer the
 * `isDrawerAction` property must be set to `true`, so that we render the correct icon button which shows the actions
 * menu.
 */
const ResourceActions: FunctionComponent<{
  cluster: string;
  fluxResource: IFluxResource;
  instance: IPluginInstance;
  isDrawerAction?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  manifest: any;
  name: string;
  namespace: string;
  path: string;
  refetch: () => void;
  resource: string;
}> = ({
  instance,
  fluxResource,
  cluster,
  namespace,
  name,
  manifest,
  resource,
  path,
  refetch,
  isDrawerAction = false,
}) => {
  const [message, setMessage] = useState<{ message: string; severity: 'success' | 'error' }>();
  const [action, setAction] = useState<TAction>('');
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  /**
   * `handleOpenMenu` opens the menu, which is used to display the actions for a resource. The menu can then be closed
   * via the `handleCloseMenu` function.
   */
  const handleOpenMenu = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  /**
   * `handleCloseMenu` closes the menu, wich displays the actions for a resource. To open the menu the `handleOpenMenu`
   * function is used.
   */
  const handleCloseMenu = (e: Event) => {
    setAnchorEl(null);
  };

  /**
   * `handleShowAction` will show the modal for the provided action `a`. When the action is shown, we also close the
   * menu.
   */
  const handleShowAction = (a: TAction) => {
    setAnchorEl(null);
    setAction(a);
  };

  /**
   * `handleCloseAction` closes the modal for the currently open action. When the action is closed a `message` and the
   * `severity` for the message can be provided, which will then be shown in a snackbar.
   *
   * If no `message` is provided we do not show a snackbar. This can be the case when a user canceled an action, so that
   * it was not executed, so that it can also not be successfull or failed.
   */
  const handleCloseAction = (message: string, severity: 'success' | 'error') => {
    setAction('');

    if (message !== '') {
      if (severity === 'success') {
        refetch();
      }

      setMessage({ message: message, severity: severity });
    }
  };

  return (
    <>
      {isDrawerAction ? (
        <IconButton edge="end" color="inherit" sx={{ mr: 1 }} onClick={handleOpenMenu}>
          <MoreVert />
        </IconButton>
      ) : (
        <IconButton size="small" onClick={handleOpenMenu}>
          <MoreVert />
        </IconButton>
      )}

      <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
        {fluxResource.type === 'kustomizations' || fluxResource.type === 'helmreleases' ? (
          <MenuItem key="sync" onClick={() => handleShowAction('sync')}>
            <ListItemIcon>
              <SyncIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Sync</ListItemText>
          </MenuItem>
        ) : null}
        <MenuItem key="suspend" onClick={() => handleShowAction('suspend')}>
          <ListItemIcon>
            <SuspendIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Suspend</ListItemText>
        </MenuItem>
        <MenuItem key="resume" onClick={() => handleShowAction('resume')}>
          <ListItemIcon>
            <ResumeIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Resume</ListItemText>
        </MenuItem>
      </Menu>

      <Snackbar open={message !== undefined} autoHideDuration={5000} onClose={() => setMessage(undefined)}>
        <Alert onClose={() => setMessage(undefined)} severity={message?.severity} sx={{ width: '100%' }}>
          {message?.message}
        </Alert>
      </Snackbar>

      {action === 'sync' && (
        <Sync
          instance={instance}
          fluxResource={fluxResource}
          cluster={cluster}
          namespace={namespace}
          name={name}
          open={action === 'sync'}
          onClose={handleCloseAction}
        />
      )}

      {action === 'suspend' && (
        <SuspendResume
          cluster={cluster}
          namespace={namespace}
          name={name}
          manifest={manifest}
          resource={resource}
          path={path}
          action={action}
          open={action === 'suspend'}
          onClose={handleCloseAction}
        />
      )}

      {action === 'resume' && (
        <SuspendResume
          cluster={cluster}
          namespace={namespace}
          name={name}
          manifest={manifest}
          resource={resource}
          path={path}
          action={action}
          open={action === 'resume'}
          onClose={handleCloseAction}
        />
      )}
    </>
  );
};

export default ResourceActions;
