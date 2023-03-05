import {
  BugReport as DebugIcon,
  Delete as DeleteIcon,
  Difference as ScaleIcon,
  Edit as EditIcon,
  FileDownload as DownloadFileIcon,
  FileUpload as UploadFileIcon,
  MoreVert,
  PlayArrow as CreateJobIcon,
  RestartAlt as RestartIcon,
  Subject as LogsIcon,
  Terminal as TerminalIcon,
} from '@mui/icons-material';
import { Alert, IconButton, ListItemIcon, ListItemText, Menu, MenuItem, Snackbar } from '@mui/material';
import { FunctionComponent, MouseEvent, useState } from 'react';

import CreateJob from './actions/CreateJob';
import Debug from './actions/Debug';
import Delete from './actions/Delete';
import DownloadFile from './actions/DownloadFile';
import Edit from './actions/Edit';
import Logs from './actions/Logs';
import Restart from './actions/Restart';
import Scale from './actions/Scale';
import Terminal from './actions/Terminal';
import UploadFile from './actions/UploadFile';
import { IResource } from './utils';

type TAction =
  | ''
  | 'scale'
  | 'restart'
  | 'createjob'
  | 'logs'
  | 'terminal'
  | 'downloadfile'
  | 'uploadfile'
  | 'debug'
  | 'edit'
  | 'delete';

/**
 * `IResourceActionsProps` is the interface for the properties of the `ResourceActions` component.
 */
interface IResourceActionsProps {
  cluster: string;
  isDrawerAction?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  manifest: any;
  name: string;
  namespace: string;
  refetch: () => void;
  resource: IResource;
}

/**
 * The `ResourceActions` component is used to show an action menu for a resource. The action menu allows a user to edit
 * or delete a resource. There are also more icons depending on the kind of the resource, e.g. scaling Deployments and
 * StatefulSets, creating Jobs from a CronJob, geting the logs or a terminal for a Pod, etc.
 *
 * The action can be used within a row of a resource or in the details drawer of a resource. When used in a drawer the
 * `isDrawerAction` property must be set to `true`, so that we render the correct icon button which shows the actions
 * menu.
 */
const ResourceActions: FunctionComponent<IResourceActionsProps> = ({
  resource,
  cluster,
  namespace,
  name,
  manifest,
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
        {resource.id === 'deployments' || resource.id === 'statefulsets' || resource.id === 'replicasets' ? (
          <MenuItem key="scale" onClick={() => handleShowAction('scale')}>
            <ListItemIcon>
              <ScaleIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Scale</ListItemText>
          </MenuItem>
        ) : null}
        {resource.id === 'daemonsets' || resource.id === 'deployments' || resource.id === 'statefulsets' ? (
          <MenuItem key="restart" onClick={() => handleShowAction('restart')}>
            <ListItemIcon>
              <RestartIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Restart</ListItemText>
          </MenuItem>
        ) : null}
        {resource.id === 'cronjobs' ? (
          <MenuItem key="createjob" onClick={() => handleShowAction('createjob')}>
            <ListItemIcon>
              <CreateJobIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Create Job</ListItemText>
          </MenuItem>
        ) : null}
        {resource.id === 'pods' ? (
          <MenuItem key="logs" onClick={() => handleShowAction('logs')}>
            <ListItemIcon>
              <LogsIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Logs</ListItemText>
          </MenuItem>
        ) : null}
        {resource.id === 'pods' ? (
          <MenuItem key="terminal" onClick={() => handleShowAction('terminal')}>
            <ListItemIcon>
              <TerminalIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Terminal</ListItemText>
          </MenuItem>
        ) : null}
        {resource.id === 'pods' ? (
          <MenuItem key="downloadfile" onClick={() => handleShowAction('downloadfile')}>
            <ListItemIcon>
              <DownloadFileIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Download File</ListItemText>
          </MenuItem>
        ) : null}
        {resource.id === 'pods' ? (
          <MenuItem key="uploadfile" onClick={() => handleShowAction('uploadfile')}>
            <ListItemIcon>
              <UploadFileIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Upload File</ListItemText>
          </MenuItem>
        ) : null}
        {resource.id === 'pods' ? (
          <MenuItem key="debug" onClick={() => handleShowAction('debug')}>
            <ListItemIcon>
              <DebugIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Debug</ListItemText>
          </MenuItem>
        ) : null}
        <MenuItem key="edit" onClick={() => handleShowAction('edit')}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <MenuItem key="delete" onClick={() => handleShowAction('delete')}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>

      <Snackbar open={message !== undefined} autoHideDuration={5000} onClose={() => setMessage(undefined)}>
        <Alert onClose={() => setMessage(undefined)} severity={message?.severity} sx={{ width: '100%' }}>
          {message?.message}
        </Alert>
      </Snackbar>

      {action === 'scale' && (
        <Scale
          resource={resource}
          cluster={cluster}
          namespace={namespace}
          name={name}
          manifest={manifest}
          open={action === 'scale'}
          onClose={handleCloseAction}
        />
      )}

      {action === 'restart' && (
        <Restart
          resource={resource}
          cluster={cluster}
          namespace={namespace}
          name={name}
          manifest={manifest}
          open={action === 'restart'}
          onClose={handleCloseAction}
        />
      )}

      {action === 'createjob' && (
        <CreateJob
          cluster={cluster}
          namespace={namespace}
          name={name}
          cronJob={manifest}
          open={action === 'createjob'}
          onClose={handleCloseAction}
        />
      )}

      {action === 'logs' && (
        <Logs
          cluster={cluster}
          namespace={namespace}
          name={name}
          pod={manifest}
          open={action === 'logs'}
          onClose={handleCloseAction}
        />
      )}

      {action === 'terminal' && (
        <Terminal
          cluster={cluster}
          namespace={namespace}
          name={name}
          pod={manifest}
          open={action === 'terminal'}
          onClose={handleCloseAction}
        />
      )}

      {action === 'downloadfile' && (
        <DownloadFile
          cluster={cluster}
          namespace={namespace}
          name={name}
          pod={manifest}
          open={action === 'downloadfile'}
          onClose={handleCloseAction}
        />
      )}

      {action === 'uploadfile' && (
        <UploadFile
          cluster={cluster}
          namespace={namespace}
          name={name}
          pod={manifest}
          open={action === 'uploadfile'}
          onClose={handleCloseAction}
        />
      )}

      {action === 'debug' && (
        <Debug
          cluster={cluster}
          namespace={namespace}
          name={name}
          manifest={manifest}
          open={action === 'debug'}
          onClose={handleCloseAction}
        />
      )}

      {action === 'edit' && (
        <Edit
          resource={resource}
          cluster={cluster}
          namespace={namespace}
          name={name}
          manifest={manifest}
          open={action === 'edit'}
          onClose={handleCloseAction}
        />
      )}

      {action === 'delete' && (
        <Delete
          resource={resource}
          cluster={cluster}
          namespace={namespace}
          name={name}
          open={action === 'delete'}
          onClose={handleCloseAction}
        />
      )}
    </>
  );
};

export default ResourceActions;
