import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

// IPluginDefaults is the interface which is used for the default property of the plugin panel components. This is
// required, so that a user must not define a cluster or namespace in a plugin. Instead we will use the cluster or
// namespace of the parent team or application.
export interface IPluginDefaults {
  cluster: string;
  namespace: string;
  name: string;
}

// IPluginTimes is the interface for the times property of the plugin panel. The times property can be used to retrieve
// only data for a selected time range in a plugin. For example the Prometheus uses these properties to show only
// metrics for the selected time range.
export interface IPluginTimes {
  timeEnd: number;
  timeStart: number;
}

// IPluginData is the data for a plugin as it is configured in the kobs configuration file. These properties will be
// returned by our Go API for each plugin.
export interface IPluginData {
  name: string;
  displayName: string;
  description: string;
  home: boolean;
  type: string;
  options?: IPluginDataOptions;
}

export interface IPluginDataOptions {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}

// IPluginPageProps are the properties for the page component of each plugin. While the displayName and description are
// mostly used for the UI, the name is required to identify a configured plugin instance in the backend.
export interface IPluginPageProps {
  name: string;
  displayName: string;
  description: string;
  options?: IPluginDataOptions;
}

// IPluginPanelProps is the interface for the properties of the panel component of each plugin. It contains the already
// mentioned defaults and times, the name of the plugin, the panel title and description and some options. The options
// can be very different between plugins and should be defined by an interface which is special to each plugin.
export interface IPluginPanelProps {
  defaults: IPluginDefaults;
  times?: IPluginTimes;
  name: string;
  title: string;
  description?: string;
  pluginOptions?: IPluginDataOptions;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
  showDetails?: (details: React.ReactNode) => void;
}

// IPluginPreviewProps is the interface for the properties of the preview component of each plugin. It contains the
export interface IPluginPreviewProps {
  times: IPluginTimes;
  title: string;
  name: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  options?: any;
}

// IPluginComponent is the interface which must be implemented by each plugin. It must contain an icon and panel
// component. The page and preview component is optional for each plugin.
export interface IPluginComponent {
  home?: React.FunctionComponent<IPluginPageProps>;
  icon: string;
  page?: React.FunctionComponent<IPluginPageProps>;
  panel: React.FunctionComponent<IPluginPanelProps>;
  preview?: React.FunctionComponent<IPluginPreviewProps>;
}

// IPlugins is the interface for a list of plugins. The key of this interface is the plugin type and must correspond
// with the type, which is returned when the plugin is registered in the Go code.
export interface IPluginComponents {
  [key: string]: IPluginComponent;
}

// IPluginsContext is the plugin context, is contains all plugins.
export interface IPluginsContext {
  components: IPluginComponents;
  getPluginDetails: (name: string) => IPluginData | undefined;
  getPluginHome: () => IPluginData[];
  getPluginIcon: (type: string) => string;
  plugins: IPluginData[];
}

// PluginsContext is the plugin context object.
export const PluginsContext = React.createContext<IPluginsContext>({
  components: {},
  getPluginDetails: (name: string) => {
    return undefined;
  },
  getPluginHome: () => {
    return [];
  },
  getPluginIcon: (type: string) => {
    return '';
  },
  plugins: [],
});

// PluginsContextConsumer is a React component that subscribes to context changes. This lets you subscribe to a context
// within a function component.
export const PluginsContextConsumer = PluginsContext.Consumer;

// IPluginsContextProviderProps is the interface for the PluginsContextProvider component. The only valid properties are
// child components of the type ReactElement.
interface IPluginsContextProviderProps {
  children: React.ReactElement;
  components: IPluginComponents;
}

// PluginsContextProvider is a Provider React component that allows consuming components to subscribe to context
// changes.
export const PluginsContextProvider: React.FunctionComponent<IPluginsContextProviderProps> = ({
  children,
  components,
}: IPluginsContextProviderProps) => {
  // fetchData is used to retrieve all plugins from the gRPC API. The retrieved plugins are used in the plugins property
  // of the plugins context. The function is called on the first render of the component and in case of an error it can
  // be called via the retry button in the Alert component were the error message is shown.
  const { isError, isLoading, error, data, refetch } = useQuery<IPluginData[], Error>(
    ['shared/pluginscontext'],
    async () => {
      try {
        const response = await fetch('/api/plugins', { method: 'get' });
        const json = await response.json();

        if (response.status >= 200 && response.status < 300) {
          return json;
        } else {
          if (json.error) {
            throw new Error(json.error);
          } else {
            throw new Error('An unknown error occured');
          }
        }
      } catch (err) {
        throw err;
      }
    },
  );

  // getPluginDetails returns the single plugin by his name. This allows us to retrieve the plugin type and description
  // by his identifier (name). If their is no plugin with the given name the function returns undefined.
  const getPluginDetails = (name: string): IPluginData | undefined => {
    if (!data) {
      return undefined;
    }

    const filteredPlugins = data.filter((plugin) => plugin.name === name);
    if (filteredPlugins.length === 1) {
      return filteredPlugins[0];
    }

    return undefined;
  };

  const getPluginHome = (): IPluginData[] => {
    const pluginHome = data?.filter((p) => p.home);
    return pluginHome || [];
  };

  const getPluginIcon = (type: string): string => {
    if (components.hasOwnProperty(type)) {
      return components[type].icon;
    }

    return '';
  };

  // As long as the isLoading property of the state is true, we are showing a spinner in the cernter of the screen.
  if (isLoading) {
    return <Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />;
  }

  // If an error occured during the fetch of the plugins, we are showing the error message in the cernter of the screen
  // within an Alert component. The Alert component contains a Retry button to call the fetchData function again.
  if (isError) {
    return (
      <Alert
        style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }}
        variant={AlertVariant.danger}
        title="Could not initialize plugins context"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IPluginData[], Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  // If the fetching of the plugins is finished and was successful, we render the context provider and pass in the
  // plugins from the state.
  return (
    <PluginsContext.Provider
      value={{
        components: components,
        getPluginDetails: getPluginDetails,
        getPluginHome: getPluginHome,
        getPluginIcon: getPluginIcon,
        plugins: data,
      }}
    >
      {children}
    </PluginsContext.Provider>
  );
};
