import { MoreVert } from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  IconButton,
  IconButtonProps,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { FunctionComponent, ReactNode, useContext } from 'react';

import { GridContext, IGridContext } from '../../context/GridContext';

interface IPluginPanelProps {
  actions?: ReactNode;
  children: ReactNode;
  description?: string;
  title: string;
}

/**
 * The `PluginPanel` component is a wrapper for a panel in a dashboard, which can be used by all plugins to ensure a
 * unique styling across all panels and plugins in a dashboard.
 *
 * Based on the `autoHeight` property of a row, we set the height of the panel to `100%` or not. This is required so
 * that the panel takes the full height when the `autoHeight` property is `false` and the height of the children when it
 * is set to `true`.
 */
export const PluginPanel: FunctionComponent<IPluginPanelProps> = ({
  title,
  description,
  children,
  actions,
}: IPluginPanelProps) => {
  const gridContext = useContext<IGridContext>(GridContext);

  if (!title) {
    return <>{children}</>;
  }

  return (
    <Card sx={{ height: gridContext.autoHeight ? undefined : '100%', p: 4, width: '100%' }}>
      <Stack sx={{ pb: 2 }} direction="row" justifyContent="space-between" alignItems="center">
        <Tooltip title={description}>
          <Typography noWrap={true} variant="subtitle2">
            <strong>{title}</strong>
          </Typography>
        </Tooltip>

        {actions && <Box pl={6}>{actions}</Box>}
      </Stack>

      <Box
        sx={{
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          height: '100%',
          overflowY: 'auto',
          pb: 4,
          width: '100%',
        }}
      >
        {children}
      </Box>
    </Card>
  );
};

interface IPluginPanelActionButtonProps {
  props?: IconButtonProps;
}

/**
 * The `PluginPanelActionButton` renders an action button, which can be used to open a menu in the `PluginPanel`
 * component. Using this button instead of a custom `IconButton` in the action of a `PluginPanel` component ensures,
 * that we have a unique styling across all panels.
 */
export const PluginPanelActionButton: FunctionComponent<IPluginPanelActionButtonProps> = ({ props }) => {
  return (
    <IconButton size="small" sx={{ m: 0, p: 0 }} disableRipple={true} {...props}>
      <MoreVert />
    </IconButton>
  );
};

interface IPluginPanelErrorProps {
  description?: string;
  details: string;
  documentation: string;
  example?: string;
  message: string;
  title: string;
}

/**
 * The `PluginPanelError` is a wrapper around the `PluginPanel` to render an error, which was thrown by a plugin on a
 * dashboard.
 *
 * This should only be used to render errors, where the validation of the user provided options in a panel are failing,
 * all other errors can be rendered via the `PluginPanel` and `UseQueryWrapper` components.
 */
export const PluginPanelError: React.FunctionComponent<IPluginPanelErrorProps> = ({
  title,
  description,
  message,
  details,
  documentation,
  example,
}: IPluginPanelErrorProps) => {
  return (
    <PluginPanel title={title} description={description}>
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" href={documentation} target="_blank">
            DOCUMENTATION
          </Button>
        }
      >
        <AlertTitle>{message}</AlertTitle>
        {details}
        {example && (
          <Box sx={{ ml: 4, mt: 4, p: 2, whiteSpace: 'pre-wrap' }}>
            <code>{example}</code>
          </Box>
        )}
      </Alert>
    </PluginPanel>
  );
};
