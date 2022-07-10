import { Alert, AlertActionLink, AlertVariant, Spinner } from '@patternfly/react-core';
import { QueryObserverResult, useQuery } from 'react-query';
import React from 'react';

import { IPlugin } from '../crds/dashboard';

export interface IGroup {
  title: string;
  plugin: IPlugin;
}

// INotificationsContext is the plugin context, is contains all plugins.
export interface INotificationsContext {
  groups: IGroup[];
}

// NotificationsContext is the plugin context object.
export const NotificationsContext = React.createContext<INotificationsContext>({
  groups: [],
});

// NotificationsContextConsumer is a React component that subscribes to context changes. This lets you subscribe to a
// context within a function component.
export const NotificationsContextConsumer = NotificationsContext.Consumer;

// INotificationsContextProviderProps is the interface for the NotificationsContextProvider component. The only valid
// properties are child components of the type ReactElement.
interface INotificationsContextProviderProps {
  children: React.ReactElement;
}

// NotificationsContextProvider is a Provider React component that allows consuming components to subscribe to context
// changes.
export const NotificationsContextProvider: React.FunctionComponent<INotificationsContextProviderProps> = ({
  children,
}: INotificationsContextProviderProps) => {
  const { isError, isLoading, error, data, refetch } = useQuery<IGroup[], Error>(
    ['app/notifications/groups'],
    async () => {
      const response = await fetch('/api/notifications/groups', { method: 'get' });
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
    },
  );

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
        title="Could not initialize notifications context"
        actionLinks={
          <React.Fragment>
            <AlertActionLink onClick={(): Promise<QueryObserverResult<IGroup[], Error>> => refetch()}>
              Retry
            </AlertActionLink>
          </React.Fragment>
        }
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  // If the fetching of the auth context is finished and was successful, we render the context provider.
  return (
    <NotificationsContext.Provider
      value={{
        groups: data ? data : [],
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};
