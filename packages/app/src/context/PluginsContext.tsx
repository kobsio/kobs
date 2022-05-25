import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { IPluginInstance } from '@kobsio/shared';

// IPluginsContext is the plugin context, is contains all the instances of all configured plugins.
export interface IPluginsContext {
  getInstance: (satellite: string, type: string, name: string) => IPluginInstance | undefined;
  getInstances: (type: string, name: string) => IPluginInstance[];
  getPluginTypes: () => string[];
  instances: IPluginInstance[];
}

// PluginsContext is the plugin context object.
export const PluginsContext = React.createContext<IPluginsContext>({
  getInstance: () => undefined,
  getInstances: () => [],
  getPluginTypes: () => [],
  instances: [],
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
  const { isError, isLoading, error, data, refetch } = useQuery<IPluginInstance[], Error>(
    ['app/pluginscontext'],
    async () => {
      const response = await fetch('/api/plugins', { method: 'get' });
      const json = await response.json();

      if (response.status >= 200 && response.status < 300) {
        return json ? json : [];
      } else {
        if (json.error) {
          throw new Error(json.error);
        } else {
          throw new Error('An unknown error occured');
        }
      }
    },
  );

  // getInstance returns a single instance with the given type and name or undefined, when we could not found a instance
  // with the provided type and name.
  const getInstance = (satellite: string, type: string, name: string): IPluginInstance | undefined => {
    const instances = data?.filter(
      (instance) => instance.satellite === satellite && instance.name === name && instance.type === type,
    );
    if (instances?.length === 1) {
      return instances[0];
    }

    return undefined;
  };

  // getInstances returns a list of instances, with the given type and name. The type filter is only applied if it is
  // not an empty string. The same counts for the name filter. This means when no type and name is provided all plugin
  // instances will be returned.
  const getInstances = (type: string, name: string): IPluginInstance[] => {
    const instancesFilteredByType = type ? data?.filter((instance) => instance.type === type) : data;
    const instancesFilteredByName = instancesFilteredByType?.filter((instance) => instance.name.includes(name));

    return instancesFilteredByName || [];
  };

  // getPluginTypes returns a list of strings with the unique types of the plugin instances.
  const getPluginTypes = (): string[] => {
    const types = data?.map((instance) => instance.type);
    return types ? types.filter((value, index, self) => self.indexOf(value) === index).sort() : [];
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
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IPluginInstance[], Error>> => refetch()}>
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
        getInstance: getInstance,
        getInstances: getInstances,
        getPluginTypes: getPluginTypes,
        instances: data,
      }}
    >
      {children}
    </PluginsContext.Provider>
  );
};
