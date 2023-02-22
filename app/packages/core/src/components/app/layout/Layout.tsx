import { useTheme, Hidden, Box, Drawer, useMediaQuery, Breakpoint } from '@mui/material';
import { useState, FunctionComponent, ReactNode } from 'react';

import Header from './Header';
import Sidebar from './Sidebar';

import { ITheme } from '../../../utils/theme';

/**
 * `drawerWidth` defines the width of the drawer, which contains a `Sidebar` component to render the navigation for the
 * app.
 */
const drawerWidth = 258;

/**
 * `useIsWidthUp` is a helper function to check if the current screen width is larger the then the one defined in the
 * provided `breakpoint`.
 */
const useIsWidthUp = (breakpoint: Breakpoint): boolean => {
  const theme = useTheme<ITheme>();
  return useMediaQuery(theme.breakpoints.up(breakpoint));
};

/**
 * `ILayoutProps` are the properties of the `Layout` component. The component only needs a `children`, which should be
 * a React Router with all the routes, which should be rendered in the defined layout.
 */
interface ILayoutProps {
  children: ReactNode;
}

/**
 * The `Layout` component defines the layout of our app. All routes should be rendered within this layout. The only
 * exceptions form this are the routes which are used to authenticate a user, when he isn't authenticated.
 *
 * Our layout consists of a drawer, which is always visible on large screens and hidden on small screens. On small
 * screens our layout also contains a header with an button to toggle the drawer. Finally the layout defines the main
 * area where the contains of all routes is rendered.
 */
export const Layout: FunctionComponent<ILayoutProps> = ({ children }: ILayoutProps) => {
  const isLgUp = useIsWidthUp('lg');
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box component="nav" sx={{ flexShrink: { md: 0 }, width: { md: drawerWidth } }} aria-label="drawer">
        <Hidden mdUp={true} implementation="js">
          <Drawer
            variant="temporary"
            PaperProps={{ style: { width: drawerWidth } }}
            sx={{
              '> div': { borderRight: 0 },
            }}
            open={mobileOpen}
            onClose={handleDrawerToggle}
          >
            <Sidebar />
          </Drawer>
        </Hidden>
        <Hidden mdDown={true} implementation="css">
          <Drawer
            variant="permanent"
            PaperProps={{ style: { width: drawerWidth } }}
            sx={{
              '> div': { borderRight: 0 },
            }}
            onClose={handleDrawerToggle}
          >
            <Sidebar />
          </Drawer>
        </Hidden>
      </Box>

      <Box
        sx={{
          display: 'flex',
          flex: 1,
          flexDirection: 'column',
          maxWidth: '100%',
        }}
      >
        <Hidden mdUp={true}>
          <Header handleDrawerToggle={handleDrawerToggle} />
        </Hidden>

        <Box
          component="main"
          sx={(theme) => ({
            background: theme.palette.background.default,
            flex: 1,
          })}
          p={isLgUp ? 12 : 5}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
