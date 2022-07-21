import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import { Octokit } from '@octokit/rest';
import React from 'react';

import { IPluginInstance, PluginPanel } from '@kobsio/shared';
import LoginLink from './LoginLink';

// IAuthContext is the plugin context, is contains all plugins.
export interface IAuthContext {
  getOctokitClient: () => Octokit;
  organization: string;
  token: string;
  username: string;
}

// AuthContext is the plugin context object.
export const AuthContext = React.createContext<IAuthContext>({
  getOctokitClient: () => new Octokit(),
  organization: '',
  token: '',
  username: '',
});

// AuthContextConsumer is a React component that subscribes to context changes. This lets you subscribe to a
// context within a function component.
export const AuthContextConsumer = AuthContext.Consumer;

// IAuthContextProviderProps is the interface for the AuthContextProvider component. The only valid
// properties are child components of the type ReactElement.
interface IAuthContextProviderProps {
  title: string;
  instance: IPluginInstance;
  children: React.ReactElement;
}

// AuthContextProvider is a Provider React component that allows consuming components to subscribe to context
// changes.
export const AuthContextProvider: React.FunctionComponent<IAuthContextProviderProps> = ({
  title,
  instance,
  children,
}: IAuthContextProviderProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<
    { organization: string; token: string; username: string },
    Error
  >(['github/oauth', instance], async () => {
    const response = await fetch('/api/plugins/github/oauth', {
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
      return json;
    } else {
      if (json.error) {
        throw new Error(json.error);
      } else {
        throw new Error('An unknown error occured');
      }
    }
  });

  const getOctokitClient = (): Octokit => {
    return new Octokit({
      auth: data?.token,
    });
  };

  if (isLoading) {
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
    const alertContent = (
      <Alert
        variant={AlertVariant.danger}
        isInline={title ? true : false}
        title="Could not initialize auth context"
        actionLinks={
          <React.Fragment>
            <LoginLink instance={instance} />
            <AlertActionLink
              onClick={(): Promise<QueryObserverResult<{ organization: string; token: string }, Error>> => refetch()}
            >
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
        getOctokitClient: getOctokitClient,
        organization: data.organization,
        token: data.token,
        username: data.username,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
