import { useQuery } from '@tanstack/react-query';
import { createContext, ReactNode } from 'react';

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
export interface IPluginPanelProps {
  instance: IPluginInstance;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  times?: any;
}

/**
 * `IPlugin` is the interface which must be implemented by a plugin. Each plugin must export it's `type` so that we can
 * select it based on the user provided type in a dashboard. A plugin can also export a `icon` component, a component
 * which is rendered as a `page` and a component for a `panel` in a dashboard.
 */
export interface IPlugin {
  icon?: ReactNode;
  page?: React.FunctionComponent<IPluginPageProps>;
  panel?: React.FunctionComponent<IPluginPanelProps>;
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
  getInstance: (id: string) => IPluginInstance | undefined;
  getPlugin: (type: string) => IPlugin | undefined;
  instances: IPluginInstance[];
}

/**
 * `PluginContext` is the context to manage all configured plugins within the app. The plugin context contains all
 * instances of all plugins configured by a user. It also contains a method to a single instance (`getInstance`) by it's
 * `id` and a method (`getPlugin`) to get a plugin by it's `type`.
 */
export const PluginContext = createContext<IPluginContext>({
  getInstance: (id: string) => undefined,
  getPlugin: (type: string) => undefined,
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
export const PluginContextProvider: React.FunctionComponent<IPluginContextProviderProps> = ({
  plugins,
  children,
}: IPluginContextProviderProps) => {
  const { isError, isLoading, data } = useQuery<IPluginInstance[], Error>(['core/plugincontext'], async () => {
    return [];
  });

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
    return <div></div>;
  }

  if (isError) {
    return <div></div>;
  }

  return (
    <PluginContext.Provider
      value={{
        getInstance: getInstance,
        getPlugin: getPlugin,
        instances: data,
      }}
    >
      {children}
    </PluginContext.Provider>
  );
};
