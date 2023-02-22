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
import { Link as RouterLink, LinkProps as RouterLinkProps, useLocation, useNavigate } from 'react-router-dom';

import logo from '../../../assets/logo.svg';
import { APIContext, IAPIContext } from '../../../context/APIContext';
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
  const toggleItem = (item: string) => {
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
          color: theme.sidebar.color,
          display: 'block',
          fontSize: theme.typography.caption.fontSize,
          fontWeight: theme.typography.fontWeightMedium,
          opacity: 0.4,
          p: theme.spacing(4, 7, 1),
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
  isOpen: boolean;
  item: INavigationItem;
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
        onClick={() => toggleOpen(item.name)}
        sx={{
          '&:hover': {
            background: 'rgba(0, 0, 0, 0.08)',
          },
          fontWeight: theme.typography.fontWeightRegular,
          pl: theme.spacing(8),
          pr: theme.spacing(7),
          py: theme.spacing(3),
          svg: {
            color: theme.sidebar.color,
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
            m: 0,
            span: {
              color: theme.sidebar.color,
              fontSize: 'typography.body1.fontSize',
              px: theme.spacing(4),
              py: 0,
            },
          }}
        >
          {item.name}
        </ListItemText>
        {isOpen ? (
          <ExpandLess sx={{ color: `rgba(${theme.sidebar.color}, 0.5)` }} />
        ) : (
          <ExpandMore sx={{ color: `rgba(${theme.sidebar.color}, 0.5)` }} />
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
          '&:hover': {
            background: isActive ? darken(theme.sidebar.background, 0.13) : 'rgba(0, 0, 0, 0.08)',
          },
          background: isActive ? darken(theme.sidebar.background, 0.13) : undefined,
          fontWeight: theme.typography.fontWeightRegular,
          pl: theme.spacing(8),
          pr: theme.spacing(7),
          py: theme.spacing(3),
          svg: {
            color: theme.sidebar.color,
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
            m: 0,
            span: {
              color: theme.sidebar.color,
              fontSize: theme.typography.body1.fontSize,
              px: theme.spacing(4),
              py: 0,
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
          '&:hover': {
            background: isActive ? darken(theme.sidebar.background, 0.13) : 'rgba(0, 0, 0, 0.08)',
          },
          background: isActive ? darken(theme.sidebar.background, 0.13) : undefined,
          color: theme.sidebar.color,
          opacity: isActive ? 1 : 0.7,
          pb: theme.spacing(2),
          pl: theme.spacing(17.5),
          pt: theme.spacing(2),
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
          pl: theme.spacing(6),
          pr: theme.spacing(6),
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
        <Box sx={{ ml: theme.spacing(1) }}>kobs</Box>
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
  const navigate = useNavigate();
  const apiContext = useContext<IAPIContext>(APIContext);
  const [anchorMenu, setAnchorMenu] = useState<null | HTMLElement>(null);

  /**
   * `toggleMenu` toggles the menu, which contains the sign out button.
   */
  const toggleMenu = (event: MouseEvent<HTMLDivElement>) => {
    setAnchorMenu(event.currentTarget);
  };

  /**
   * `closeMenu` closes the menu, which contains the sign out button.
   */
  const closeMenu = () => {
    setAnchorMenu(null);
  };

  /**
   * `handleSignOut` handles the sign out of the user. To sign out a user we have to delete all stored tokens and
   * cokkies. When this is done we can redirect the user to the login page.
   */
  const handleSignOut = async () => {
    try {
      await apiContext.client.signout();
      navigate(`/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
    } catch (_) {}
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
          position: 'absolute',
          px: theme.spacing(4),
          py: theme.spacing(2.75),
        }}
      >
        <Grid container={true} spacing={2}>
          <Grid item={true}>
            <Badge
              sx={{
                mr: theme.spacing(1),
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
              <Avatar alt="Lucy Lavender" src={getProfileImageURL(apiContext.getUser()?.id ?? '')} />
            </Badge>
          </Grid>
          <Grid item={true}>
            <Typography sx={{ color: theme.sidebar.footer.color }} variant="body2">
              {apiContext.getUser()?.name || 'Unknown'}
            </Typography>
            <Typography
              sx={{
                color: theme.sidebar.footer.color,
                display: 'block',
                fontSize: '0.7rem',
                p: '1px',
              }}
              variant="caption"
            >
              {apiContext.getUser()?.id || 'Unknown'}
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
  const apiContext = useContext<IAPIContext>(APIContext);

  return (
    <Box sx={{ height: '100vh' }}>
      <Box
        sx={{
          '&::-webkit-scrollbar': {
            display: 'none',
          },
          height: 'calc(100vh - 62px)',
          overflowY: 'auto',
        }}
      >
        <SidebarHeader />
        <List disablePadding={true}>
          <Box
            sx={{
              py: theme.spacing(2.5),
            }}
          >
            {apiContext.getUser()?.navigation.map((group) => (
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
