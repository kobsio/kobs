import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from '@tanstack/react-query';
import React from 'react';

import { IPluginInstance, PluginPanel } from '@kobsio/shared';
import LoginModal from './LoginModal';

// IAuthContext is the plugin context, is contains all plugins.
export interface IAuthContext {
  url: string;
}

// AuthContext is the plugin context object.
export const AuthContext = React.createContext<IAuthContext>({
  url: '',
});

// AuthContextConsumer is a React component that subscribes to context changes. This lets you subscribe to a
// context within a function component.
export const AuthContextConsumer = AuthContext.Consumer;

// IAuthContextProviderProps is the interface for the AuthContextProvider component. The only valid
// properties are child components of the type ReactElement.
interface IAuthContextProviderProps {
  title: string;
  isNotification: boolean;
  instance: IPluginInstance;
  children: React.ReactElement;
}

// AuthContextProvider is a Provider React component that allows consuming components to subscribe to context
// changes.
export const AuthContextProvider: React.FunctionComponent<IAuthContextProviderProps> = ({
  title,
  isNotification,
  instance,
  children,
}: IAuthContextProviderProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<string, Error>(['jira/auth', instance], async () => {
    const response = await fetch('/api/plugins/jira/auth', {
      headers: {
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'x-kobs-plugin': instance.name,
        // eslint-disable-next-line @typescript-eslint/naming-convention
        'x-kobs-satellite': instance.satellite,
      },
      method: 'get',
    });
    const json = await response.json();

    if (response.status >= 200 && response.status < 300) {
      return json.url;
    } else {
      if (json.error) {
        throw new Error(json.error);
      } else {
        throw new Error('An unknown error occured');
      }
    }
  });

  if (isLoading) {
    if (isNotification) {
      return <div></div>;
    }

    const loadingContent = (
      <div className="pf-u-text-align-center">
        <Spinner />
      </div>
    );

    return title ? <PluginPanel title={title}>{loadingContent}</PluginPanel> : loadingContent;
  }

  // If an error occured during the fetch of the plugins, we are showing the error message in the cernter of the screen
  // within an Alert component. The Alert component contains a Retry button to call the fetchData function again.
  if (isError) {
    if (isNotification) {
      return <div></div>;
    }

    const alertContent = (
      <Alert
        variant={AlertVariant.danger}
        isInline={title ? true : false}
        title="Could not initialize auth context"
        actionLinks={
          <React.Fragment>
            <LoginModal instance={instance} refetchAuth={refetch} />
            <AlertActionLink onClick={(): Promise<QueryObserverResult<string, Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );

    return title ? <PluginPanel title={title}>{alertContent}</PluginPanel> : alertContent;
  }

  if (!data) {
    return null;
  }

  // If the fetching of the auth context is finished and was successful, we render the context provider.
  return (
    <AuthContext.Provider
      value={{
        url: data,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};