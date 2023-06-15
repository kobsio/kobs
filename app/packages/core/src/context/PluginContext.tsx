import { Alert, AlertTitle, Box, Button, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, createContext, ReactNode, useContext } from 'react';

import { APIContext, APIError } from './APIContext';

import { ITimes } from '../utils/times';

/**
 * `IPluginPageProps` is the interface which defines the properties which are passed to the `page` component of a plugin.
 * Currently this is only the `instance` for which the plugin page should be shown.
 */
export interface IPluginPageProps {
  instance: IPluginInstance;
}

/**
 * `IPluginPanelProps` is the interface which defines the properties which are passed to the `panel` component of a
 * plugin. This is the `instance` for which the panel should be shown and the `times` for a user selected time range in
 * a dashboard (where the panel is displayed).
 */
export interface IPluginPanelProps<T> {
  description?: string;
  instance: IPluginInstance;
  options?: T;
  setTimes: (times: ITimes) => void;
  times: ITimes;
  title: string;
}

/**
 * `IPlugin` is the interface which must be implemented by a plugin. Each plugin must export it's `type` so that we can
 * select it based on the user provided type in a dashboard. A plugin can also export a `icon` component, a component
 * which is rendered as a `page` and a component for a `panel` in a dashboard.
 */
export interface IPlugin {
  description: string;
  example?: string;
  icon?: ReactNode;
  page?: FunctionComponent<IPluginPageProps>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  panel?: FunctionComponent<IPluginPanelProps<any>>;
  type: string;
}

/**
 * `IPluginInstance` is the interface for a plugin instance as it is defined by a user in the configuration. Each plugin
 * has an id, cluster, type and name. A plugin also can have a description and a map of options. The corresponding Go
 * struct can be found in the following file: pkg/plugins/plugin/plugin.go. Please be aware that the `FrontendOptions`
 * field from the Go struct becomes the `options` field in the `IPluginInstance` interface.
 */
export interface IPluginInstance {
  cluster: string;
  description?: string;
  id: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: Record<string, any>;
  type: string;
}

/**
 * `IPluginContext` is the interface which must be implemented by the `PluginContext`. The plugin context must contain
 * all plugin instances, and two methods to get and instance by it's `id` and to get a plugin by it's `type`.
 */
export interface IPluginContext {
  getClusters(): string[];
  getInstance: (id: string) => IPluginInstance | undefined;
  getPlugin: (type: string) => IPlugin | undefined;
  getPluginTypes(): string[];
  instances: IPluginInstance[];
}

/**
 * `PluginContext` is the context to manage all configured plugins within the app. The plugin context contains all
 * instances of all plugins configured by a user. It also contains a method to a single instance (`getInstance`) by it's
 * `id` and a method (`getPlugin`) to get a plugin by it's `type`.
 */
export const PluginContext = createContext<IPluginContext>({
  getClusters: () => [],
  getInstance: (id: string) => undefined,
  getPlugin: (type: string) => undefined,
  getPluginTypes: () => [],
  instances: [],
});

/**
 * `PluginContextConsumer` is a React component that subscribes to all changes in the plugin context. This let us
 * subscribe to the context within a function component.
 */
export const PluginContextConsumer = PluginContext.Consumer;

/**
 * `IPluginContextProviderProps` is the interface for the `PluginContextProvider` component. To initialize the context
 * we have to pass a list of `plugins` to the component. All the provided `children` can then subscribe to the context.
 */
interface IPluginContextProviderProps {
  children: ReactNode;
  plugins: IPlugin[];
}

/**
 * `PluginContextProvider` is a provider component that allows us comsuming components to subscribe to the context
 * changes.
 */
export const PluginContextProvider: FunctionComponent<IPluginContextProviderProps> = ({ plugins, children }) => {
  const { client } = useContext(APIContext);
  const { isError, error, isLoading, data, refetch } = useQuery<IPluginInstance[] | null, APIError>(
    ['core/plugincontext'],
    () => client.get<IPluginInstance[] | null>('/api/plugins'),
  );

  /**
   * getClusters lists the cluster-names of all plugins
   * when /api/plugins responds with no plugins, this method will return an empty array
   */
  const getClusters = (): string[] => {
    if (!data) {
      return [];
    }

    const clusters = new Set<string>();
    for (const instance of data) {
      clusters.add(instance.cluster);
    }

    return Array.from(clusters);
  };

  /**
   * getPluginTypes lists the pluginType-names of all plugins
   * when /api/plugins responds with no plugins, this method will return an empty array
   */
  const getPluginTypes = (): string[] => {
    if (!data) {
      return [];
    }

    const plugins = new Set<string>();
    for (const instance of data) {
      plugins.add(instance.type);
    }

    return Array.from(plugins).sort();
  };

  /**
   * `getInstance` returns a `IPluginInstance` with the provided `id`. If we can not found a instance with the provided
   * `id` it returns `undefined`.
   */
  const getInstance = (id: string): IPluginInstance | undefined => {
    return data?.find((instance) => instance.id === id);
  };

  /**
   * `getPlugin` returns a `IPlugin` with the provided `type`. If we can not found a plugin with the provided `id` it
   * returns `undefined`.
   */
  const getPlugin = (type: string): IPlugin | undefined => {
    return plugins.find((plugin) => plugin.type === type);
  };

  if (isLoading) {
    return (
      <Box minHeight="100vh" minWidth="100%" display="flex" flexDirection="column" justifyContent="center">
        <Box sx={{ display: 'inline-flex', mx: 'auto' }}>
          <CircularProgress />
        </Box>
      </Box>
    );
  }

  if (isError) {
    return (
      <Box minHeight="100vh" minWidth="100%" display="flex" flexDirection="column" justifyContent="center">
        <Box sx={{ display: 'inline-flex', mx: 'auto' }}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={() => refetch()}>
                RETRY
              </Button>
            }
          >
            <AlertTitle>Loading the Plugin Context failed.</AlertTitle>
            {error.message}
          </Alert>
        </Box>
      </Box>
    );
  }

  return (
    <PluginContext.Provider
      value={{
        getClusters: getClusters,
        getInstance: getInstance,
        getPlugin: getPlugin,
        getPluginTypes: getPluginTypes,
        instances: data || [],
      }}
    >
      {children}
    </PluginContext.Provider>
  );
};

/**
 * `pluginBasePath` can be used to get the base path to a plugin page based on the provided `instance`.
 */
export const pluginBasePath = (instance: IPluginInstance): string => {
  return `/plugins/${encodeURIComponent(instance.cluster)}/${encodeURIComponent(instance.type)}/${encodeURIComponent(
    instance.name,
  )}`;
};

/**
 * `pluginBasePath` can be used to get the base path to a plugin page based on the provided `cluster`, `type` and
 * `name`.
 */
export const pluginBasePathAlt = (cluster: string, type: string, name: string): string => {
  return `/plugins/${encodeURIComponent(cluster)}/${encodeURIComponent(type)}/${encodeURIComponent(name)}`;
};
