import { Apps, Extension, Groups, Hive, Home, Subject } from '@mui/icons-material';
import MenuIcon from '@mui/icons-material/Menu';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
// import { Link } from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import { useState } from 'react';

const drawerWidth = 240;

const SidebarItems: { name: string; path: string; icon: React.ReactNode }[] = [
  {
    icon: <Home sx={{ color: 'text.primary' }} />,
    name: 'Home',
    path: '/',
  },
  {
    icon: <Apps sx={{ color: 'text.primary' }} />,
    name: 'Applications',
    path: '/applications',
  },
  {
    icon: <Hive sx={{ color: 'text.primary' }} />,
    name: 'Topology',
    path: '/topology',
  },
  {
    icon: <Groups sx={{ color: 'text.primary' }} />,
    name: 'Teams',
    path: '/teams',
  },
  {
    icon: <Subject sx={{ color: 'text.primary' }} />,
    name: 'Kubernetes Resources',
    path: '/resources',
  },
  {
    icon: <Extension sx={{ color: 'text.primary' }} />,
    name: 'Plugins',
    path: '/plugins',
  },
];

interface ILayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FunctionComponent<ILayoutProps> = ({ children }: ILayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = (): void => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar />
      <Divider />
      <List>
        {SidebarItems.map(({ name, icon }, index) => (
          <ListItem key={name} disablePadding={true}>
            <ListItemButton>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText primary={name} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          backgroundColor: 'background.default',
          ml: { sm: `${drawerWidth}px` },
          width: { sm: `calc(100% - ${drawerWidth}px)` },
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ display: { sm: 'none' }, mr: 2 }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap={true} component="div">
            Responsive drawer
          </Typography>
        </Toolbar>
      </AppBar>
      <Box component="nav" sx={{ flexShrink: { sm: 0 }, width: { sm: drawerWidth } }} aria-label="mailbox folders">
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true,
          }}
          sx={{
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            display: { sm: 'none', xs: 'block' },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            // eslint-disable-next-line @typescript-eslint/naming-convention
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            display: { sm: 'block', xs: 'none' },
          }}
          open={true}
        >
          {drawer}
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
};

export default Layout;
