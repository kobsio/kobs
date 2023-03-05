import { Menu } from '@mui/icons-material';
import { AppBar, IconButton, Toolbar, useTheme } from '@mui/material';
import { FunctionComponent } from 'react';

import { ITheme } from '../../../utils/theme';

/**
 * `IHeaderProps` are the properties for the `Header` component. We just need a `handleDrawerToggle` function to toggle
 * the drawer from the `Header` component.
 */
interface IHeaderProps {
  handleDrawerToggle: () => void;
}

/**
 * The `Header` component renders the `AppBar` of the app. We only show the header on small screens, because on large
 * screens the sidebar is always visible and the header is only used to toggle the sidebar.
 */
const Header: FunctionComponent<IHeaderProps> = ({ handleDrawerToggle }) => {
  const theme = useTheme<ITheme>();

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        backgroundColor: theme.header.background,
        color: theme.header.color,
      }}
    >
      <Toolbar>
        <IconButton color="inherit" aria-label="open drawer" onClick={handleDrawerToggle}>
          <Menu />
        </IconButton>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
