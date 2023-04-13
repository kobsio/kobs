import { APIContext, IAPIContext, IPluginInstance, UseQueryWrapper, useQueryState } from '@kobsio/core';
import { Alert, AlertTitle } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import { FunctionComponent, useContext } from 'react';

export const AuthCallback: FunctionComponent<{ instance: IPluginInstance }> = ({ instance }) => {
  const apiContext = useContext<IAPIContext>(APIContext);
  const [options] = useQueryState<{ code: string; state: string }>({ code: '', state: '' });

  const { isError, isLoading, error, data } = useQuery<
    { organization: string; token: string; username: string },
    Error
  >(['github/oauth/callback', instance, options.code, options.state], async () => {
    return apiContext.client.get<{ organization: string; token: string; username: string }>(
      `/api/plugins/github/oauth/callback?code=${options.code}&state=${options.state}`,
      {
        headers: {
          'x-kobs-cluster': instance.cluster,
          'x-kobs-plugin': instance.name,
        },
      },
    );
  });

  return (
    <UseQueryWrapper
      error={error}
      errorTitle="Authentication failed"
      isError={isError}
      isLoading={isLoading}
      isNoData={!data}
      noDataTitle="No authentication data was found"
    >
      <Alert>
        <AlertTitle>Authentication process finished</AlertTitle>
        You are now authenticated for the organization {data?.organization} as {data?.username}. You can close this
        window and go back to your page and click the <b>Retry</b>.
      </Alert>
    </UseQueryWrapper>
  );
};
