import React from 'react';
import { Spinner } from '@patternfly/react-core';
import { useQuery } from '@tanstack/react-query';

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
  const { isLoading, data } = useQuery<IUser, Error>(['app/authcontext'], async () => {
    try {
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
    } catch (err) {
      window.location.replace(`/auth?redirect=${encodeURIComponent(window.location.href)}`);
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
