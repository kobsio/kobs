import { APIContext, IAPIContext, IPluginInstance, PluginPanel } from '@kobsio/core';
import { Alert, AlertTitle, Box, Button, CircularProgress } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, createContext, useContext } from 'react';

import { Login } from './Login';

export interface IAuthContext {
  url: string;
}

export const AuthContext = createContext<IAuthContext>({
  url: '',
});

export const AuthContextConsumer = AuthContext.Consumer;

export const AuthContextProvider: FunctionComponent<{
  children: React.ReactElement;
  description?: string;
  instance: IPluginInstance;
  title: string;
}> = ({ title, description, instance, children }) => {
  const apiContext = useContext<IAPIContext>(APIContext);

  const { isError, isLoading, error, data, refetch } = useQuery<{ url: string }, Error>(
    ['jira/auth', instance],
    async () => {
      return apiContext.client.get<{ url: string }>('/api/plugins/jira/auth', {
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      });
    },
  );

  /**
   * We can not use the `UseQueryWrapper` component here, because the `AuthContextProvider` can be used on the Jira
   * plugin page or within a panel on a dashboard, so that we have to render the loading indicator and the error alert
   * within a PluginPanel component when a title is provided or without a PluginPanel component when no title is
   * provided.
   *
   * Besides that we also have to render an additional LoginButton component, when the user is not authenticated within
   * the error message which is not supported by the `UseQueryWrapper` component.
   */
  if (isLoading) {
    const loadingComponent = (
      <Box minWidth="100%" display="flex" flexDirection="column" justifyContent="center">
        <Box sx={{ display: 'inline-flex', mx: 'auto' }}>
          <CircularProgress role="loading-indicator" />
        </Box>
      </Box>
    );

    if (title) {
      return (
        <PluginPanel title={title} description={description}>
          {loadingComponent}
        </PluginPanel>
      );
    }

    return loadingComponent;
  }

  if (isError) {
    const errorComponent = (
      <Alert
        severity="error"
        action={
          <>
            <Login instance={instance} refetchAuth={refetch} />
            <Button color="inherit" size="small" onClick={() => refetch()}>
              RETRY
            </Button>
          </>
        }
      >
        <AlertTitle>Authentication failed</AlertTitle>
        {error.message}
      </Alert>
    );

    if (title) {
      return (
        <PluginPanel title={title} description={description}>
          {errorComponent}
        </PluginPanel>
      );
    }

    return errorComponent;
  }

  return (
    <AuthContext.Provider
      value={{
        url: data?.url ?? '',
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
