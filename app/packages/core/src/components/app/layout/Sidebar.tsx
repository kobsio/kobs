import { ExpandLess, ExpandMore, LogoutOutlined } from '@mui/icons-material';
import {
  Avatar,
  Badge,
  Collapse,
  darken,
  Grid,
  ListItemButton,
  ListItemIcon,
  Menu,
  MenuItem,
  Typography,
  useTheme,
} from '@mui/material';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import Stack from '@mui/material/Stack';
import Toolbar from '@mui/material/Toolbar';
import md5 from 'md5';
import { FunctionComponent, forwardRef, useContext, useState, MouseEvent } from 'react';
import { Link as RouterLink, LinkProps as RouterLinkProps, useLocation } from 'react-router-dom';

import logo from '../../../assets/logo.svg';
import { AppContext, IAppContext } from '../../../context/AppContext';
import { INavigation, INavigationItem, INavigationSubItem } from '../../../crds/user';
import { ITheme } from '../../../utils/theme';

/**
 * `Link` is a helper function, which we need to use the `Link` (imported as `RouterLink`) component from React Router
 * within the `ListItem` component from Material UI.
 */
const Link = forwardRef<HTMLAnchorElement, RouterLinkProps>(function link(itemProps, ref) {
  return <RouterLink ref={ref} {...itemProps} role={undefined} />;
});

/**
 * `initItems` is a helper function to initialize the `items` state in the `SidebarGroup` component. It returns a list
 * of items, where the provided `link` of an item matches the current path of the location. This is required so that we
 * can determine of the navigation group should be opened or closed, when the user opens the app.
 */
const initItems = (path: string, group: INavigation): string[] => {
  const items = [];

  for (const item of group.items) {
    if (path === item.link) {
      items.push(item.name);
    }

    if (item.items) {
      for (const subItem of item.items) {
        if (path === subItem.link) {
          items.push(item.name);
        }
      }
    }
  }

  return items;
};

/**
 * `ISidebarGroupProps` are the properties for the `SidebarGroup`. The component only requires a `group` which
 * implements the `INavigation` interface.
 */
interface ISidebarGroupProps {
  group: INavigation;
}

/**
 * The `SidebarGroup` component is used to render a navigation group and the items for a group. Within the component we
 * also show / hide the items and sub items of a group via the `toogleItem` function. When the user clicks on a item,
 * which contains other items, open the sub items menu and add the `name` of the item to the `items` state. When a item
 * is present in the state it is marked as open.
 */
const SidebarGroup: FunctionComponent<ISidebarGroupProps> = ({ group }: ISidebarGroupProps) => {
  const theme = useTheme<ITheme>();
  const location = useLocation();
  const [items, setItems] = useState<string[]>(() => initItems(location.pathname, group));

  /**
   * `toggleItem` is used to add / remove the provided `item` from the `items` state. If the provided `item` is empty,
   * all items are removed from the state.
   */
  const toggleItem = (item: string): void => {
    if (item === '') {
      setItems([]);
    } else {
      if (items.includes(item)) {
        setItems(items.filter((i) => i !== item));
      } else {
        setItems([...items, item]);
      }
    }
  };

  return (
    <Stack>
      <Box
        sx={{
          color: 'sidebar.color',
          display: 'block',
          fontSize: theme.typography.caption.fontSize,
          fontWeight: theme.typography.fontWeightMedium,
          opacity: 0.4,
          padding: theme.spacing(4, 7, 1),
          textTransform: 'uppercase',
        }}
      >
        {group.name}
      </Box>
      {group.items.map((item) => (
        <Stack key={item.name}>
          <SidebarItem item={item} isOpen={items.includes(item.name)} toggleOpen={toggleItem} />
          {item.items ? (
            <Collapse key={`${item.name}-items`} in={items.includes(item.name)} timeout="auto" unmountOnExit={true}>
              {item.items.map((subItem) => (
                <SidebarSubItem key={subItem.name} item={subItem} />
              ))}
            </Collapse>
          ) : null}
        </Stack>
      ))}
    </Stack>
  );
};

/**
 * `ISidebarItemProps` are the props for the `SidebarItem` component. The component requires a `item` which implements
 * the `INavigationItem` interface. It also needs an `isOpen` boolean value and a `toggleOpen` function so that we can
 * show / hide the sub items.
 */
interface ISidebarItemProps {
  item: INavigationItem;
  isOpen: boolean;
  toggleOpen: (item: string) => void;
}

/**
 * The `SidebarItem` component is used to render an item in the sidebar navigation. Since an item can contain other sub
 * items or "just" a link we have to check if the item contains other items to render the component with the correct
 * style. If the item contains other items we render an `ListItemButton` which can be used to toggle the sub items in
 * the sidebar. If the item contains a link we render `ListItemButton` which the user can click to go to the
 * corresponding page. If the current location matches the provided link we will mark the item as active.
 */
const SidebarItem: FunctionComponent<ISidebarItemProps> = ({ item, isOpen, toggleOpen }: ISidebarItemProps) => {
  const theme = useTheme<ITheme>();
  const location = useLocation();
  const appContext = useContext<IAppContext>(AppContext);
  const isActive = location.pathname === item.link;

  if (item.items && item.items.length > 0) {
    return (
      <ListItemButton
        onClick={(): void => toggleOpen(item.name)}
        sx={{
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '&:hover': {
            background: 'rgba(0, 0, 0, 0.08)',
          },
          fontWeight: theme.typography.fontWeightRegular,
          paddingBottom: theme.spacing(3),
          paddingLeft: theme.spacing(8),
          paddingRight: theme.spacing(7),
          paddingTop: theme.spacing(3),
          svg: {
            color: 'sidebar.color',
            fontSize: '20px',
            height: '20px',
            opacity: 0.5,
            width: '20px',
          },
        }}
      >
        {appContext.getIcon(item.icon)}
        <ListItemText
          sx={{
            margin: 0,
            span: {
              color: 'sidebar.color',
              fontSize: 'typography.body1.fontSize',
              paddingBottom: 0,
              paddingLeft: theme.spacing(4),
              paddingRight: theme.spacing(4),
              paddingTop: 0,
            },
          }}
        >
          {item.name}
        </ListItemText>
        {isOpen ? (
          <ExpandLess sx={{ color: 'rgba(sidebar.color, 0.5)' }} />
        ) : (
          <ExpandMore sx={{ color: 'rgba(sidebar.color, 0.5)' }} />
        )}
      </ListItemButton>
    );
  }

  if (item.link) {
    return (
      <ListItemButton
        component={Link}
        to={item.link}
        sx={{
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '&:hover': {
            background: isActive ? darken(theme.sidebar.background, 0.13) : 'rgba(0, 0, 0, 0.08)',
          },
          background: isActive ? darken(theme.sidebar.background, 0.13) : undefined,
          fontWeight: theme.typography.fontWeightRegular,
          paddingBottom: theme.spacing(3),
          paddingLeft: theme.spacing(8),
          paddingRight: theme.spacing(7),
          paddingTop: theme.spacing(3),
          svg: {
            color: 'sidebar.color',
            fontSize: '20px',
            height: '20px',
            opacity: 0.5,
            width: '20px',
          },
        }}
      >
        {appContext.getIcon(item.icon)}
        <ListItemText
          sx={{
            margin: 0,
            span: {
              color: 'sidebar.color',
              fontSize: 'typography.body1.fontSize',
              paddingBottom: 0,
              paddingLeft: theme.spacing(4),
              paddingRight: theme.spacing(4),
              paddingTop: 0,
            },
          }}
        >
          {item.name}
        </ListItemText>
      </ListItemButton>
    );
  }

  return null;
};

/**
 * `ISidebarSubItemProps` are the properties for the `SidebarSubItem` component, which requires an item which implements
 * the `INavigationSubItem` interface.
 */
interface ISidebarSubItemProps {
  item: INavigationSubItem;
}

/**
 * The `SidebarSubItem` component is used to render a sub item from in the sidebar. A sub item is similar to a normal
 * item, but can only contain a link to a page an no other items. The link is rendered via the `ListItemButton`
 * component. If the current location matches the provided link we will mark the item as active.
 */
const SidebarSubItem: FunctionComponent<ISidebarSubItemProps> = ({ item }: ISidebarSubItemProps) => {
  const theme = useTheme<ITheme>();
  const location = useLocation();
  const isActive = location.pathname === item.link;

  if (item.link) {
    return (
      <ListItemButton
        component={Link}
        to={item.link}
        sx={{
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '&:hover': {
            background: isActive ? darken(theme.sidebar.background, 0.13) : 'rgba(0, 0, 0, 0.08)',
          },
          background: isActive ? darken(theme.sidebar.background, 0.13) : undefined,
          color: 'sidebar.color',
          opacity: isActive ? 1 : 0.7,
          paddingBottom: theme.spacing(2),
          paddingLeft: theme.spacing(17.5),
          paddingTop: theme.spacing(2),
        }}
      >
        {item.name}
      </ListItemButton>
    );
  }

  return null;
};

/**
 * The `SidebarHeader` component renders the header in the sidebar. The header contains a `Toolbar` component with the
 * logo and name of the app. When a user clicks on the header he will be redirected to the home page.
 */
const SidebarHeader: FunctionComponent = () => {
  const theme = useTheme<ITheme>();

  return (
    <Toolbar>
      <ListItemButton
        component={Link}
        to="/"
        sx={{
          // eslint-disable-next-line @typescript-eslint/naming-convention
          '&:hover': {
            backgroundColor: theme.sidebar.header.background,
          },
          backgroundColor: theme.sidebar.header.background,
          color: theme.sidebar.header.color,
          cursor: 'pointer',
          fontSize: theme.typography.h5.fontSize,
          fontWeight: theme.typography.fontWeightMedium,
          justifyContent: 'center',
          minHeight: '56px',
          paddingLeft: theme.spacing(6),
          paddingRight: theme.spacing(6),
        }}
      >
        <Box
          sx={{
            img: {
              height: '32px',
              width: '32px',
            },
          }}
        >
          <img src={logo} alt="" />
        </Box>
        <Box sx={{ marginLeft: 1 }}>kobs</Box>
      </ListItemButton>
    </Toolbar>
  );
};

/**
 * The `SidebarFooter` component renders a footer with some basic user information, like the Gravatar image, the users
 * name and email addess. When a user click on the item we show a menu, which can be used by the user to sign out of the
 * app.
 */
const SidebarFooter: FunctionComponent = () => {
  const theme = useTheme<ITheme>();
  const [anchorMenu, setAnchorMenu] = useState<null | HTMLElement>(null);

  /**
   * `toggleMenu` toggles the menu, which contains the sign out button.
   */
  const toggleMenu = (event: MouseEvent<HTMLDivElement>): void => {
    setAnchorMenu(event.currentTarget);
  };

  /**
   * `closeMenu` closes the menu, which contains the sign out button.
   */
  const closeMenu = (): void => {
    setAnchorMenu(null);
  };

  /**
   * `handleSignOut` handles the sign out of the user. To sign out a user we have to delete all stored tokens and
   * cokkies. When this is done we can redirect the user to the login page.
   */
  const handleSignOut = async (): Promise<void> => {
    // TODO: Add sign out logic
  };

  /**
   * `getProfileImageURL` returns the Gravatar for the provided email address. If the user doesn't use Gravatar the
   * default Gravatar is returned.
   */
  const getProfileImageURL = (email: string): string => {
    return 'https://secure.gravatar.com/avatar/' + md5(email) + '?size=64&default=mm';
  };

  return (
    <>
      <Box
        aria-owns={Boolean(anchorMenu) ? 'sidebarfooter-usermenu' : undefined}
        onClick={toggleMenu}
        sx={{
          backgroundColor: theme.sidebar.footer.background,
          borderRight: '1px solid rgba(0, 0, 0, 0.12)',
          bottom: 0,
          cursor: 'pointer',
          minWidth: '100%',
          paddingBottom: theme.spacing(2.75),
          paddingLeft: theme.spacing(4),
          paddingRight: theme.spacing(4),
          paddingTop: theme.spacing(2.75),
          position: 'absolute',
        }}
      >
        <Grid container={true} spacing={2}>
          <Grid item={true}>
            <Badge
              sx={{
                marginRight: theme.spacing(1),
                span: {
                  backgroundColor: theme.sidebar.footer.online.background,
                  border: `1.5px solid ${theme.palette.common.white}`,
                  borderRadius: '50%',
                  height: '12px',
                  width: '12px',
                },
              }}
              anchorOrigin={{
                horizontal: 'right',
                vertical: 'bottom',
              }}
              overlap="circular"
              variant="dot"
            >
              <Avatar alt="Lucy Lavender" src={getProfileImageURL('admin@kobs.io')} />
            </Badge>
          </Grid>
          <Grid item={true}>
            <Typography sx={{ color: theme.sidebar.footer.color }} variant="body2">
              user name
            </Typography>
            <Typography
              sx={{
                color: theme.sidebar.footer.color,
                display: 'block',
                fontSize: '0.7rem',
                padding: '1px',
              }}
              variant="caption"
            >
              user email
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Menu
        id="sidebarfooter-usermenu"
        anchorEl={anchorMenu}
        anchorOrigin={{
          horizontal: 'center',
          vertical: 'top',
        }}
        transformOrigin={{
          horizontal: 'center',
          vertical: 'bottom',
        }}
        open={Boolean(anchorMenu)}
        onClose={closeMenu}
      >
        <MenuItem onClick={handleSignOut}>
          <ListItemIcon>
            <LogoutOutlined fontSize="small" />
          </ListItemIcon>
          <ListItemText>Sign Out</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

/**
 * The `Sidebar` component contains the sidebar for the app, with the app header and footer and the user defined
 * navigation items, which are stored in the `AppContext`.
 *
 * Since the sidebar footer should always stick to the bottom we have to calculate the height of the sidebar header and
 * the navigation by substracting the height of the footer from the view height.
 */
const Sidebar: FunctionComponent = () => {
  const theme = useTheme<ITheme>();

  return (
    <Box sx={{ height: '100vh' }}>
      <Box sx={{ height: 'calc(100vh - 62px)', overflowX: 'scroll' }}>
        <SidebarHeader />
        <List disablePadding={true}>
          <Box
            sx={{
              paddingY: theme.spacing(2.5),
            }}
          >
            {[
              {
                items: [
                  { icon: 'home', link: '/', name: 'Home' },
                  { icon: 'search', link: '/search', name: 'Search' },
                ],
                name: 'Home',
              },
              {
                items: [
                  { icon: 'apps', link: '/applications', name: 'Applications' },
                  { icon: 'topology', link: '/topology', name: 'Topology' },
                  { icon: 'team', link: '/teams', name: 'Teams' },
                  { icon: 'kubernetes', link: '/resources', name: 'Kubernetes Resources' },
                  { icon: 'plugin', link: '/plugins', name: 'Plugins' },
                ],
                name: 'Resources',
              },
            ].map((group) => (
              <SidebarGroup key={group.name} group={group} />
            ))}
          </Box>
        </List>
      </Box>
      <SidebarFooter />
    </Box>
  );
};

export default Sidebar;
