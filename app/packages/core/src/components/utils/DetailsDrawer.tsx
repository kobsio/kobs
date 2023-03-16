import { Close } from '@mui/icons-material';
import { Drawer, IconButton, Toolbar, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { FunctionComponent, ReactNode } from 'react';

interface IDetailsDrawerProps {
  actions?: ReactNode;
  children: ReactNode;
  onClose: () => void;
  open: boolean;
  size: 'small' | 'large';
  subtitle?: string;
  title: string;
}

/**
 * The `DetailsDrawer` component can be used to display details of a resource within a drawer. To display the drawer the
 * `open` property must be set to `true`. When the drawer is closed the `onClose` function is called. Thw `width`
 * property defines the width of the drawer. The default width is `450`.
 *
 * It is also possible to set a title, subtitle and some action which will be displayed on the left of the close button.
 * Therefor a action should be a `IconButton` where the `edge` property is set to `end`.
 */
export const DetailsDrawer: FunctionComponent<IDetailsDrawerProps> = ({
  actions,
  children,
  onClose,
  open,
  subtitle,
  title,
  size,
}) => {
  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          backgroundColor: 'background.default',
        },
      }}
    >
      <Box sx={{ px: 4, width: { md: size === 'small' ? 450 : 750, xs: '100vw' } }} aria-label="drawer">
        <Toolbar
          sx={{
            '&.MuiToolbar-root': {
              px: 0,
            },
          }}
        >
          <Box
            sx={{
              WebkitBoxOrient: 'vertical',
              WebkitLineClamp: '2',
              display: '-webkit-box',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              {title}

              {subtitle && (
                <Typography pl={2} color="text.secondary" variant="caption">
                  {subtitle}
                </Typography>
              )}
            </Typography>
          </Box>

          {actions}

          <IconButton edge="end" color="inherit" onClick={onClose}>
            <Close />
          </IconButton>
        </Toolbar>

        {children}
      </Box>
    </Drawer>
  );
};
