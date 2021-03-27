import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';

import { GetPluginsRequest, GetPluginsResponse, PluginShort } from 'proto/plugins_pb';
import { PluginsPromiseClient } from 'proto/plugins_grpc_web_pb';
import { apiURL } from 'utils/constants';

// pluginsService is the Plugins gRPC service, which is used to get all configured plugins.
const pluginsService = new PluginsPromiseClient(apiURL, null, null);

// IDataState is the state for the PluginsContext. The state contains all plugins, an error message and a loading
// indicator.
interface IDataState {
  error: string;
  isLoading: boolean;
  plugins: PluginShort.AsObject[];
}

// IPluginsContext is the plugin context, is contains all plugins.
export interface IPluginsContext {
  getPluginDetails: (name: string) => PluginShort.AsObject | undefined;
  plugins: PluginShort.AsObject[];
}

// PluginsContext is the plugin context object.
export const PluginsContext = React.createContext<IPluginsContext>({
  getPluginDetails: (name: string) => {
    return undefined;
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
}

// PluginsContextProvider is a Provider React component that allows consuming components to subscribe to context
// changes.
export const PluginsContextProvider: React.FunctionComponent<IPluginsContextProviderProps> = ({
  children,
}: IPluginsContextProviderProps) => {
  const [data, setData] = useState<IDataState>({
    error: '',
    isLoading: true,
    plugins: [],
  });

  // fetchData is used to retrieve all plugins from the gRPC API. The retrieved plugins are used in the plugins property
  // of the plugins context. The function is called on the first render of the component and in case of an error it can
  // be called via the retry button in the Alert component were the error message is shown.
  const fetchData = useCallback(async () => {
    try {
      const getPluginsRequest = new GetPluginsRequest();
      const getPluginsResponse: GetPluginsResponse = await pluginsService.getPlugins(getPluginsRequest, null);
      const tmpPlugins = getPluginsResponse.toObject().pluginsList;

      if (tmpPlugins) {
        setData({
          error: '',
          isLoading: false,
          plugins: tmpPlugins,
        });
      } else {
        setData({
          error: '',
          isLoading: false,
          plugins: [],
        });
      }
    } catch (err) {
      setData({
        error: err.message,
        isLoading: false,
        plugins: [],
      });
    }
  }, []);

  // getPluginDetails returns the single plugin by his name. This allows us to retrieve the plugin type and description
  // by his identifier (name). If their is no plugin with the given name the function returns undefined.
  const getPluginDetails = (name: string): PluginShort.AsObject | undefined => {
    const filteredPlugins = data.plugins.filter((plugin) => plugin.name === name);
    if (filteredPlugins.length === 1) {
      return filteredPlugins[0];
    }

    return undefined;
  };

  // retry calls the fetchData function and can be triggered via the retry button in the Alert component in case of an
  // error. We can not call the fetchData function directly, because we have to set the isLoading property to true
  // first.
  const retry = (): void => {
    setData({ ...data, isLoading: true });
    fetchData();
  };

  // useEffect is used to call the fetchData function on the first render of the component.
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // As long as the isLoading property of the state is true, we are showing a spinner in the cernter of the screen.
  if (data.isLoading) {
    return <Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />;
  }

  // If an error occured during the fetch of the plugins, we are showing the error message in the cernter of the screen
  // within an Alert component. The Alert component contains a Retry button to call the fetchData function again.
  if (data.error) {
    return (
      <Alert
        style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }}
        variant={AlertVariant.danger}
        title="Could not initialize plugins context"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={retry}>Retry</AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{data.error}</p>
      </Alert>
    );
  }

  // If the fetching of the plugins is finished and was successful, we render the context provider and pass in the
  // plugins from the state.
  return (
    <PluginsContext.Provider
      value={{
        getPluginDetails: getPluginDetails,
        plugins: data.plugins,
      }}
    >
      {children}
    </PluginsContext.Provider>
  );
};
