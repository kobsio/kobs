import {
  DashboardOutlined,
  AppsOutlined,
  HomeOutlined,
  PersonOutlined,
  PeopleOutlined,
  HubOutlined,
  SearchOutlined,
  GridViewOutlined,
  ExtensionOutlined,
  ListOutlined,
  BarChartOutlined,
  StackedBarChartOutlined,
  TableChartOutlined,
  PieChartOutline,
  DonutLargeOutlined,
  SailingOutlined,
  WidgetsOutlined,
  MenuBookOutlined,
} from '@mui/icons-material';
import { createContext, ReactNode } from 'react';

/**
 * `defaultIcons` defines a default set of Material UI icons, which we can use within the app. These are mainly used
 * in the `Sidebar` component, so a user can customize the icons of the navigation items.
 */
const defaultIcons: IAppIcons = {
  apps: <AppsOutlined />,
  barChart: <BarChartOutlined />,
  dashboard: <DashboardOutlined />,
  default: <DashboardOutlined />,
  documentation: <MenuBookOutlined />,
  donutChart: <DonutLargeOutlined />,
  grid: <GridViewOutlined />,
  home: <HomeOutlined />,
  kubernetes: <SailingOutlined />,
  lineChart: <StackedBarChartOutlined />,
  list: <ListOutlined />,
  pieChart: <PieChartOutline />,
  plugin: <ExtensionOutlined />,
  search: <SearchOutlined />,
  table: <TableChartOutlined />,
  team: <PeopleOutlined />,
  topology: <HubOutlined />,
  user: <PersonOutlined />,
  widgets: <WidgetsOutlined />,
};

/**
 * `IAppIcons` is the interface which must be implemented by the `defaultIcons` variable or by the user defined icons.
 */
export interface IAppIcons {
  [key: string]: ReactNode;
}

/**
 * `IAppContext` defines the interface for the app context. The app context must contain a function to get an item via
 * it's string representation.
 */
export interface IAppContext {
  getIcon: (icon: string | undefined) => ReactNode;
}

/**
 * `AppContext` is the context to manage all app related settings. The app context can be used to get an item via it's
 * string representation via the `getIcon` function, where the name of the icon is defined via the `icon` property.
 */
export const AppContext = createContext<IAppContext>({
  getIcon: (icon: string | undefined) => {
    return <DashboardOutlined />;
  },
});

/**
 * `AppContextConsumer` is a React component that subscribes to all changes in the app context. This let us subscribe to
 * the context within a function component.
 */
export const AppContextConsumer = AppContext.Consumer;

/**
 * `IAppContextProviderProps` is the interface for the `AppContextProvider` component. To initialize the context an
 * optional map of `icons` can be passed to the component. All the provided `children` can then subscribe to the context.
 */
interface IAppContextProviderProps {
  icons?: IAppIcons;
  children: ReactNode;
}

/**
 * `AppContextProvider` is a provider component that allows us comsuming components to subscribe to the context changes.
 */
export const AppContextProvider: React.FunctionComponent<IAppContextProviderProps> = ({
  icons,
  children,
}: IAppContextProviderProps) => {
  /**
   * `getIcon` returns a Material UI icon for the provided `icon` string. If a user has specified a list of `icons` via
   * the corresponding property, we will return a icon from this map. If a user hasn't specified a map of `icons` we
   * return a icon from the `defaultIcons` variable.
   *
   * For both cases we return the icon with the `default` string if we can not find a `icon` with the provided string in
   * the list of icons.
   */
  const getIcon = (icon: string | undefined): ReactNode => {
    if (icons) {
      if (icon && icon in icons) {
        return icons[icon];
      }

      return icons['default'];
    }

    if (icon && icon in defaultIcons) {
      return defaultIcons[icon];
    }

    return defaultIcons['default'];
  };

  return (
    <AppContext.Provider
      value={{
        getIcon: getIcon,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
