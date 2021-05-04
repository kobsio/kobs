import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import React, { useCallback, useEffect, useState } from 'react';

import { ClustersPromiseClient, GetTemplatesRequest, GetTemplatesResponse } from 'proto/clusters_grpc_web_pb';
import {
  GetPluginsRequest,
  GetPluginsResponse,
  Plugin,
  PluginShort,
  PluginsPromiseClient,
} from 'proto/plugins_grpc_web_pb';
import { Template } from 'proto/template_pb';
import { apiURL } from 'utils/constants';

// interpolate is used to replace the variables in a plugin template with the provided values for the variables. More
// information on this function can be found in the app/src/components/resources/ResourceDetails.tsx component, where
// it is used in a similar way.
const interpolate = (str: string, variables: IVariables, interpolator: string[] = ['<<', '>>']): string => {
  return str
    .split(interpolator[0])
    .map((s1, i) => {
      if (i === 0) {
        return s1;
      }

      const s2 = s1.split(interpolator[1]);
      if (s1 === s2[0]) {
        return interpolator[0] + s2[0];
      }

      if (s2.length > 1) {
        s2[0] = s2[0] && variables.hasOwnProperty(s2[0].trim()) ? variables[s2[0].trim()] : interpolator.join('');
      }

      return s2.join('');
    })
    .join('');
};

// pluginsService is the Plugins gRPC service, which is used to get all configured plugins.
const pluginsService = new PluginsPromiseClient(apiURL, null, null);

// clustersService is the Plugins gRPC service, which is used to get all templates for plugins.
const clustersService = new ClustersPromiseClient(apiURL, null, null);

interface IVariables {
  [key: string]: string;
}

// IDataState is the state for the PluginsContext. The state contains all plugins, an error message and a loading
// indicator.
interface IDataState {
  error: string;
  isLoading: boolean;
  plugins: PluginShort.AsObject[];
  templates: Template.AsObject[];
}

// IPluginsContext is the plugin context, is contains all plugins.
export interface IPluginsContext {
  getPluginDetails: (name: string) => PluginShort.AsObject | undefined;
  getTemplate: (name: string, variables: [string, string][] | IVariables) => Plugin.AsObject | undefined;
  plugins: PluginShort.AsObject[];
  templates: Template.AsObject[];
}

// PluginsContext is the plugin context object.
export const PluginsContext = React.createContext<IPluginsContext>({
  getPluginDetails: (name: string) => {
    return undefined;
  },
  getTemplate: (name: string, variables: [string, string][] | IVariables) => {
    return undefined;
  },
  plugins: [],
  templates: [],
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
  const [data, setData] = useState<IDataState>({ error: '', isLoading: true, plugins: [], templates: [] });

  // fetchData is used to retrieve all plugins from the gRPC API. The retrieved plugins are used in the plugins property
  // of the plugins context. The function is called on the first render of the component and in case of an error it can
  // be called via the retry button in the Alert component were the error message is shown.
  const fetchData = useCallback(async () => {
    try {
      const getPluginsRequest = new GetPluginsRequest();
      const getPluginsResponse: GetPluginsResponse = await pluginsService.getPlugins(getPluginsRequest, null);
      const tmpPlugins = getPluginsResponse.toObject().pluginsList;

      const getTemplatesRequest = new GetTemplatesRequest();
      const getTemplatesResponse: GetTemplatesResponse = await clustersService.getTemplates(getTemplatesRequest, null);
      const tmpTemplates = getTemplatesResponse.toObject().templatesList;

      if (tmpPlugins) {
        setData({ error: '', isLoading: false, plugins: tmpPlugins, templates: tmpTemplates });
      } else {
        setData({ error: '', isLoading: false, plugins: [], templates: [] });
      }
    } catch (err) {
      setData({ error: err.message, isLoading: false, plugins: [], templates: [] });
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

  // getTemplate return the template with the given name. This function also requires a list of variables. If the
  // template uses variables, we replace the variable placeholder "<< VARIABLE >>" with the given value.
  const getTemplate = (name: string, variables: [string, string][] | IVariables): Plugin.AsObject | undefined => {
    const filteredTemplates = data.templates.filter((template) => template.name === name);
    if (filteredTemplates.length === 1) {
      if (!filteredTemplates[0].plugin) {
        return undefined;
      }

      if (Array.isArray(variables)) {
        if (variables.length > 0) {
          const transformedVariables: IVariables = {};
          for (const variable of variables) {
            transformedVariables[variable[0]] = variable[1];
          }

          return JSON.parse(interpolate(JSON.stringify(filteredTemplates[0].plugin), transformedVariables));
        }

        return filteredTemplates[0].plugin;
      } else {
        return JSON.parse(interpolate(JSON.stringify(filteredTemplates[0].plugin), variables));
      }
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
        getTemplate: getTemplate,
        plugins: data.plugins,
        templates: data.templates,
      }}
    >
      {children}
    </PluginsContext.Provider>
  );
};
