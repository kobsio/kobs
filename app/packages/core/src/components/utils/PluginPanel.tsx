import { MoreVert } from '@mui/icons-material';
import {
  Alert,
  AlertTitle,
  Box,
  Button,
  Card,
  CircularProgress,
  IconButton,
  IconButtonProps,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from '@mui/material';
import { FunctionComponent, ReactNode, MouseEvent, useContext, useState } from 'react';
import { Link } from 'react-router-dom';

import { GridContext, IGridContext } from '../../context/GridContext';

/**
 * `IPluginPanelProps` is the interface for the properties of the `PluginPanel` component.
 */
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
export const PluginPanel: FunctionComponent<IPluginPanelProps> = ({ title, description, children, actions }) => {
  const gridContext = useContext<IGridContext>(GridContext);

  if (!title) {
    return <>{children}</>;
  }

  return (
    <Card
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flexWrap: 'nowrap',
        height: gridContext.autoHeight ? undefined : '100%',
        p: 4,
        width: '100%',
      }}
    >
      <Box sx={{ flexShrink: 0, pb: 2 }}>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Tooltip title={description}>
            <Typography noWrap={true} variant="subtitle2">
              <strong>{title}</strong>
            </Typography>
          </Tooltip>

          {actions && <Box pl={6}>{actions}</Box>}
        </Stack>
      </Box>

      <Box
        sx={{
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          flexGrow: 1,
          overflowY: 'auto',
        }}
      >
        {children}
      </Box>
    </Card>
  );
};

/**
 * `IPluginPanelActionButtonProps` is the interface for the properties of the `PluginPanelActionButton` component.
 */
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

/**
 * `IPluginPanelActionLinksProps` is the interface for the properties of the `PluginPanelActionLinks` component.
 */
interface IPluginPanelActionLinksProps {
  isFetching?: boolean;
  links: {
    link: string;
    targetBlank?: boolean;
    title: string;
  }[];
}

/**
 * The `PluginPanelActionLinks` renders an action menu with the provided list of `links`. If the `isFetching` property
 * is `true` a circular progress indicator will be rendered instead of the menu. When the `targetBlank` property is set
 * to `true` the link will be opened in a new window / tab.
 */
export const PluginPanelActionLinks: FunctionComponent<IPluginPanelActionLinksProps> = ({ isFetching, links }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  /**
   * `handleOpenMenu` opens the menu, which is used to display the link.
   */
  const handleOpenMenu = (e: MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  /**
   * `handleCloseMenu` closes the menu, wich displays the link.
   */
  const handleCloseMenu = (e: Event) => {
    setAnchorEl(null);
  };

  if (isFetching) {
    return <CircularProgress size="16px" role="loading-indicator" />;
  }

  return (
    <>
      <IconButton size="small" sx={{ m: 0, p: 0 }} disableRipple={true} onClick={handleOpenMenu}>
        <MoreVert />
      </IconButton>

      <Menu anchorEl={anchorEl} open={open} onClose={handleCloseMenu}>
        {links.map((link) => (
          <MenuItem key={link.link} component={Link} to={link.link} target={link.targetBlank ? '_blank' : undefined}>
            {link.title}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

/**
 * `IPluginPanelErrorProps` is the interface for the properties of the `PluginPanelError` component.
 */
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
export const PluginPanelError: FunctionComponent<IPluginPanelErrorProps> = ({
  title,
  description,
  message,
  details,
  documentation,
  example,
}) => {
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
