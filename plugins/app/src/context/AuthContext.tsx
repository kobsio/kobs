import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

export interface IUser {
  email: string;
  teams?: string[];
  permissions?: IPermissions;
}

export interface IPermissions {
  applications?: IApplicationPermission[];
  teams?: string[];
  plugins?: IPluginPermission[];
  resources?: IResourcesPermission[];
}

export interface IApplicationPermission {
  type: string;
  satellites?: string[];
  clusters?: string[];
  namespaces?: string[];
}

export interface IPluginPermission {
  satellite: string;
  name: string;
  type: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  permissions: any;
}

export interface IResourcesPermission {
  clusters: string[];
  namespaces: string[];
  resources: string[];
}

// IAuthContext is the plugin context, is contains all plugins.
export interface IAuthContext {
  user: IUser;
  hasPluginAccess: (satellite: string, pluginType: string, pluginName: string) => boolean;
}

// AuthContext is the plugin context object.
export const AuthContext = React.createContext<IAuthContext>({
  hasPluginAccess: (satellite: string, pluginType: string, pluginName: string) => {
    return false;
  },
  user: {
    email: '',
    permissions: undefined,
    teams: [],
  },
});

// AuthContextConsumer is a React component that subscribes to context changes. This lets you subscribe to a context
// within a function component.
export const AuthContextConsumer = AuthContext.Consumer;

// IAuthContextProviderProps is the interface for the AuthContextProvider component. The only valid properties are
// child components of the type ReactElement.
interface IAuthContextProviderProps {
  children: React.ReactElement;
}

// AuthContextProvider is a Provider React component that allows consuming components to subscribe to context
// changes.
export const AuthContextProvider: React.FunctionComponent<IAuthContextProviderProps> = ({
  children,
}: IAuthContextProviderProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IUser, Error>(['app/authcontext'], async () => {
    const response = await fetch('/api/auth', { method: 'get' });
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
  });

  const hasPluginAccess = (satellite: string, pluginType: string, pluginName: string): boolean => {
    if (data && data.permissions && data.permissions.plugins) {
      for (const plugin of data.permissions.plugins) {
        if (
          (plugin.satellite === satellite || plugin.satellite === '*') &&
          (plugin.type === pluginType || plugin.type === '*') &&
          (plugin.name === pluginName || plugin.name === '*')
        ) {
          return true;
        }
      }
    }

    return false;
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
        title="Could not initialize auth context"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IUser, Error>> => refetch()}>
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

  // If the fetching of the auth context is finished and was successful, we render the context provider.
  return (
    <AuthContext.Provider
      value={{
        hasPluginAccess: hasPluginAccess,
        user: data,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
