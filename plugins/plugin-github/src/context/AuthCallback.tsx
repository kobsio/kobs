import { Alert, AlertVariant, Spinner } from '@patternfly/react-core';
import React from 'react';
import { useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';

import { IPluginInstance } from '@kobsio/shared';

interface IAuthCallbackProps {
  instance: IPluginInstance;
}

const AuthCallback: React.FunctionComponent<IAuthCallbackProps> = ({ instance }: IAuthCallbackProps) => {
  const location = useLocation();

  const { isError, isLoading, error, data } = useQuery<
    { organization: string; token: string; username: string },
    Error
  >(['github/oauth/callback', instance, location.search], async () => {
    try {
      const params = new URLSearchParams(location.search);
      const state = params.get('state');
      const code = params.get('code');

      const response = await fetch(`/api/plugins/github/oauth/callback?code=${code}&state=${state}`, {
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
          throw new Error('An unknown error occurred');
        }
      }
    } catch (err) {
      throw err;
    }
  });

  if (isLoading) {
    return <Spinner style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }} />;
  }

  if (isError) {
    return (
      <Alert
        style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }}
        variant={AlertVariant.danger}
        title="Could not finish authentication process"
      >
        <p>{error?.message}</p>
      </Alert>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Alert
      style={{ left: '50%', position: 'fixed', top: '50%', transform: 'translate(-50%, -50%)' }}
      variant={AlertVariant.success}
      title="Authentication process finished"
    >
      <p>
        You are now authenticated for the organization {data.organization} as {data.username}. You can close this window
        and go back to your page and click the <b>Retry</b>.
      </p>
    </Alert>
  );
};

export default AuthCallback;
